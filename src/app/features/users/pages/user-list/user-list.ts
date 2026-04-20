import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { faCircleCheck, faCircleXmark, faSpinner, faUserPlus, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-user-list',
  imports: [
    FontAwesomeModule
  ],
  templateUrl: './user-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserList {

  readonly userService = inject(UserService);
  private router = inject(Router);

  readonly faUserPlus    = faUserPlus;
  readonly faSpinner     = faSpinner;
  readonly faUsers       = faUsers;
  readonly faCircleCheck = faCircleCheck;
  readonly faCircleXmark = faCircleXmark;


  ngOnInit(): void {
    this.userService.getUsers().subscribe();
  }

  goToRegister(): void {
    this.router.navigate(['/usuarios/register']);
  }
}
