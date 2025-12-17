
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Address, PaymentMethod, UserService } from '../../../../core/services/user/user.service'; 
import { Observable } from 'rxjs';

@Component({
  selector: 'app-user-forms',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './user-forms.component.html',
  styleUrls: ['./user-forms.component.css']
})
export class UserFormsComponent implements OnInit {

  addresses$!: Observable<Address[]>;
  paymentMethods$!: Observable<PaymentMethod[]>;

  newAddress: Omit<Address, '_id' | 'isDefault'> = { 
    name: '', address: '', city: '', state: '', postalCode: '', 
    phone: '', country: 'México', addressType: 'home' 
  };

  newPayment = {
    type: 'credit_card',
    cardNumber: '',     
    cardHolderName: '',
    expiryDate: ''      
  };

  constructor(private userService: UserService) { } 

  ngOnInit(): void {
    this.addresses$ = this.userService.addresses$;
    this.paymentMethods$ = this.userService.payments$;

    this.userService.loadAddresses();
    this.userService.loadPaymentMethods();
  }

  addNewAddress(): void {
    this.userService.addAddress(this.newAddress).subscribe({
        next: () => {
            alert('Dirección guardada con éxito.');
            this.resetAddressForm();
        },
        error: () => alert('Error al guardar dirección.')
    });
  }

  deleteAddress(id: string): void { 
    if(confirm('¿Borrar dirección?')) {
        this.userService.removeAddress(id).subscribe();
    }
  }

  resetAddressForm(): void {
     this.newAddress = { 
        name: '', address: '', city: '', state: '', postalCode: '', 
        phone: '', country: 'México', addressType: 'home' 
     };
  }

  addNewPayment(): void {
    this.userService.addPaymentMethod(this.newPayment).subscribe({
        next: () => {
            alert('Tarjeta guardada (Segura: **** ' + this.newPayment.cardNumber.slice(-4) + ')');
            this.resetPaymentForm();
        },
        error: (err) => {
            console.error(err);
            alert('Error al guardar tarjeta. Revisa los datos.');
        }
    });
  }

  deletePayment(id: string): void {
    if(confirm('¿Eliminar método de pago?')) {
        this.userService.removePaymentMethod(id).subscribe();
    }
  }

  resetPaymentForm(): void {
    this.newPayment = {
      type: 'credit_card',
      cardNumber: '',
      cardHolderName: '',
      expiryDate: ''
    };
  }
}