import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft, faCloudArrowUp, faEye, faSpinner, faXRay,
} from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { DicomService } from '../../services/dicom.service';

@Component({
  selector: 'app-dicom-list',
  imports: [FontAwesomeModule, TranslatePipe],
  templateUrl: './dicom-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DicomList implements OnInit {

  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  readonly dicomService = inject(DicomService);

  readonly faArrowLeft    = faArrowLeft;
  readonly faCloudArrowUp = faCloudArrowUp;
  readonly faEye          = faEye;
  readonly faSpinner      = faSpinner;
  readonly faXRay         = faXRay;

  patientId!: string;

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('patientId')!;
    this.dicomService.listByPatient(this.patientId).subscribe();
  }

  viewStudy(studyId: string): void {
    this.router.navigate(['/dicom/viewer', studyId]);
  }

  uploadStudy(): void {
    this.router.navigate(['/dicom/upload'], {
      queryParams: { patientId: this.patientId },
    });
  }

  back(): void {
    this.router.navigate(['/pacientes/detail', this.patientId]);
  }
}
