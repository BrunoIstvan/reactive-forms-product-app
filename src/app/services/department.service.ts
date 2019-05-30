import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

import { Department } from '../models/department';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  readonly url = 'http://localhost:3000/departments';

  private subject$ = new BehaviorSubject<Department[]>(null);
  private loaded = false;

  constructor(
    private http: HttpClient
  ) { }

  getAll(): Observable<Department[]> {
  
    if(!this.loaded) {
      this.http.get<Department[]>(this.url)
        .pipe( 
          tap( (deps) => console.log(deps) ) 
        )
        .subscribe(this.subject$);
        
        this.loaded = true;
    }

    return this.subject$.asObservable();

  }

  add(dep: Department): Observable<Department> {

    return this.http.post<Department>(this.url, dep)
      .pipe( 
        tap( dep =>  this.subject$.getValue().push(dep) ) 
      );

  }

  delete(dep: Department): Observable<any> {

    return this.http.delete<Department>(`${this.url}/${dep._id}`)
      .pipe( tap( () => {
        let deps = this.subject$.getValue();
        let index = deps.findIndex( d => d._id === dep._id);
        if(index >= 0) deps.splice(index, 1);


      }));

  }

  update(dep: Department): Observable<Department> {

    return this.http.patch<Department>(`${this.url}/${dep._id}`, dep)
      .pipe(
        tap( 
          (d) => {
            let deps = this.subject$.getValue();
            let index = deps.findIndex( d => d._id === dep._id);
            deps[index] = d;
          }
        )
      );

  }


}
