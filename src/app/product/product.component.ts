import { Component, OnInit, ViewChild } from '@angular/core';
import { ProductService } from '../services/product.service';
import { FormBuilder, FormGroup, Validators, NgForm } from '@angular/forms';
import { Product } from '../models/product';
import { Department } from '../models/department';
import { DepartmentService } from '../services/department.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {

  private unsubscribe$: Subject<any> = new Subject<any>();

  productForm: FormGroup = this.formBuilder.group({
    _id: [null],
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]] ,
    stock: [0, [Validators.required, Validators.min(0)]],
    price: [0, [Validators.required, Validators.min(0)]],
    departments: [[], [Validators.required]]
  });

  products: Product[] = [];
  departments: Department[] = [];

  @ViewChild('form') form : NgForm;

  constructor(
    private productService: ProductService,
    private formBuilder: FormBuilder,
    private departmentService: DepartmentService,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit() {

    this.productService.getAll()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(prods => this.products = prods);

    this.departmentService.getAll()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(deps => this.departments = deps);
      
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
  }

  save() {

    let data = this.productForm.value;
    if(data._id != null) {

      this.productService.update(data)
        .subscribe((p) => this.notity('Updated!'));

    } else {

      this.productService.add(data)
        .subscribe((p) => this.notity('Inserted!'));

    }
    this.resetForm();

  }

  delete(prod: Product) {

    this.productService.delete(prod)
      .subscribe(
        () => this.notity('Deleted!'),
        (err) => this.notity('Error: ' + err)
      )

  }

  edit(prod: Product) {

    this.productForm.setValue(prod);

  }

  private notity(msg: string) {
    this.snackbar.open(msg, "OK", { duration: 3000 });
  }

  resetForm() {

    this.form.resetForm();

  }


}
