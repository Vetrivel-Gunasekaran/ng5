import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { CmsData, objDiffKey, OfferDefinition, OfferFormControlMeta, OfferService } from '../offer/offer.service';
import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime, take, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-offer-admin',
  templateUrl: './offer-admin.component.html',
  styleUrls: ['./offer-admin.component.scss'],
})
export class OfferAdminComponent implements OnInit, AfterViewInit, OnDestroy {
  cmsData: CmsData;
  offerAdminDefinition: OfferDefinition;
  offerForm: FormGroup;
  selectOfferForm = new FormGroup({});
  offerFormControlMetaArray: Array<OfferFormControlMeta>;
  displayForm = false;
  previewOn = false;
  previousFormValue: any;
  updatedFieldName: string;

  unsubscribeAll: Subject<boolean> = new Subject<boolean>();

  constructor(private offerService: OfferService) {}

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }

  ngOnInit(): void {
    this.selectOfferForm.addControl('offer', new FormControl('NONE'));
  }

  ngAfterViewInit() {
    this.selectOfferForm
      .get('offer')
      .valueChanges.pipe(takeUntil(this.unsubscribeAll))
      .subscribe((value) => {
        this.displayForm = false;
        // console.log(value);
        this.offerService
          .getInterOfferFromAdmin(value)
          .pipe(take(1))
          .subscribe((offerAdminData) => {
            this.cmsData = offerAdminData.cmsData;
            this.offerFormControlMetaArray = offerAdminData.offerFormControlMetaArray;
            // get setup form controls
            this.generateForm();
            this.watchFormAndUpdateChanges();
            this.displayForm = true;
          });
      });
  }

  generateForm() {
    this.offerForm = new FormGroup({});
    this.offerFormControlMetaArray.map((offerFormControlMeta) => {
      this.offerForm.addControl(offerFormControlMeta.formControlName, new FormControl());
    });
    this.previousFormValue = { ...this.offerForm.value };
  }

  private watchFormAndUpdateChanges() {
    this.offerForm.valueChanges.pipe(debounceTime(800)).subscribe((change) => {
      this.updatedFieldName = objDiffKey(this.previousFormValue, this.offerForm.value);
      const offerAdminDefinition = {} as OfferDefinition;
      offerAdminDefinition.id = '2345'; // replace from definition
      this.offerFormControlMetaArray.map((ctrl) => {
        offerAdminDefinition[ctrl.formControlName] = this.offerForm.get(ctrl.formControlName).value;
      });
      this.offerAdminDefinition = { ...offerAdminDefinition };
      this.previousFormValue = { ...this.offerForm.value };
    });
  }
}