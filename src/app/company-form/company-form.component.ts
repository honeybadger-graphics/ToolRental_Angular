import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CompanyDTO, CompanyTransactionsDTO } from '../../../models';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyService } from '../services/company.service';
import { TransactionService } from '../services/transaction.service';
import { DatePipe } from '@angular/common';
import { timestamp } from 'rxjs';

@Component({
  selector: 'app-compamy-form',
  standalone: true,
  imports: [ReactiveFormsModule,DatePipe],
  templateUrl: './company-form.component.html',
  styleUrl: './company-form.component.css'
})
export class CompanyFormComponent implements OnInit {
  formBuilder = inject(FormBuilder);

  companyService = inject(CompanyService);
  transactionService = inject(TransactionService);
  router = inject(Router);

  activedRoute = inject(ActivatedRoute);

  companyForm = this.formBuilder.group<CompanyDTO>({
    id: 0,
    companyName: "",
    companyContactName: "",
    companyTaxNumber: 0,
    compRegNumber: 0,
    companyHQ: "",
    companyAccount: null,
  });
  datepickerForm = this.formBuilder.group({
    startDate: new Date(),
    endDate: new Date(),
  })
  companyTransactions: CompanyTransactionsDTO[] = [];
  filterdTransactions: CompanyTransactionsDTO[] = [];
  isNewCompany = true;
  filterClicked= false;

  ngOnInit(): void {
    const id = this.activedRoute.snapshot.params['id'];

    if (id) {
      this.isNewCompany = false;
      this.companyService.getOne(id).subscribe({
        next:(company) => this.companyForm.setValue(company),
        error: (err) => {
          // TODO: notification
          console.error(err);
        }
      });
      this.transactionService.transactionsOfCompany(id)
      .subscribe( {
        next:(companyTransactions) => this.companyTransactions =companyTransactions,
      });
  }
    }
    filterTransactions() {
      this.filterClicked=true;
      const end = this.datepickerForm.value.endDate;
      const start = this.datepickerForm.value.startDate;
      
      if(end && start){ 
        this.filterdTransactions=this.companyTransactions.filter((transaction) => transaction.timestamp>= start && transaction.timestamp<=end);
        console.log(this.filterdTransactions);
        //console.log(start)
        //console.log(end)
       }
       else{
        this.filterdTransactions =[];
       }
    }

   
  saveCompany() {
    const company = this.companyForm.value as CompanyDTO;
    
    if (this.isNewCompany) {
      this.companyService.create(company).subscribe({
        next: () => {
         
          // TODO: notification
          this.router.navigateByUrl('/list-companies');
        },
        error: (err) => {
          console.error(err);
        }
        
      });
    }
    else {
      this.companyService.update(company).subscribe({
        next: () => {
          // TODO: notification
          this.router.navigateByUrl('/list-companies');
        },
        error: (err) => {
          console.error(err);
        }
      });
    }

    
  }
}
