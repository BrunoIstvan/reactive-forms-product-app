import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { Product } from '../models/product';
import { DepartmentService } from './department.service';
import { map, tap, filter } from 'rxjs/operators';
import { Department } from '../models/department';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  readonly url = 'http://localhost:3000/products';

  private productSubject$: BehaviorSubject<Product[]> = new BehaviorSubject<Product[]>(null);

  private loaded = false;

  constructor(
    private http: HttpClient,
    private departmentService: DepartmentService
  ) { }

  getAll(): Observable<Product[]> {

    if(!this.loaded) {

      combineLatest(
        this.http.get<Product[]>(this.url),
        this.departmentService.getAll()
      )
      .pipe(

        tap(([products, departments]) => console.log(products, departments)),

        filter(([products, departments]) => products != null && departments != null),

        map(([products, departments]) => {

          products.forEach(p => {
            let ids = (p.departments as string[]);
            p.departments = ids.map( (id) => departments.find(d => d._id == id ) );
          });

          return products; 
        }),

        tap(([products]) => console.log(products))
      )
      .subscribe(prods => this.productSubject$.next(prods))
      this.loaded = true;
    }
    return this.productSubject$.asObservable();

  }

  add(prod: Product) : Observable<Product> {

    let deps = (prod.departments as Department[]).map(d => d._id);

    return this.http.post<Product>(this.url, { ...prod, deps })
      .pipe(
        tap(p => {
          this.productSubject$.getValue().push({ ...prod, _id: p._id});
        })
      );

  }

  delete(prod: Product) : Observable<any> {

    return this.http.delete(`${this.url}/${prod._id}`)
      .pipe(
        tap(() => {
          let index = this.productSubject$.getValue().findIndex(p => p._id === prod._id);
          if(index >= 0)
            this.productSubject$.getValue().splice(index, 1);
        })
      );

  }

  update(prod: Product) : Observable<Product> {

    let deps = (prod.departments as Department[]).map(d => d._id);

    return this.http.patch<Product>(`${this.url}/${prod._id}`, { ...prod, deps })
      .pipe(
        tap((p) => {
          let index = this.productSubject$.getValue().findIndex(p => p._id === prod._id);
          if(index >= 0)
            this.productSubject$.getValue()[index] = prod;
        })
      );

  }

}
