import { Component, OnInit } from '@angular/core';

import { Department } from '../models/department';
import { DepartmentService } from '../services/department.service';
import { MatSnackBar } from '@angular/material';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.css']
})
export class DepartmentComponent implements OnInit {

  depName: string = '';
  departments: Department[] = [];
  depEdit: Department = null;
  private unsubscribe$: Subject<any> = new Subject();

  constructor(
    private departmentoService: DepartmentService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {

    this.departmentoService.getAll()
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(
        (deps) => {
          this.departments = deps;
        },
        (err) => {
          console.error(err);
        })

  }

  save() {

    // se não estiver nulo, então está editando
    if(this.depEdit) { 

      this.departmentoService.update({ name: this.depName, _id: this.depEdit._id })
        .subscribe(
          (dep) => this.notify('Department updated!', 'Ok'), 
          (err) => {
            console.error(err);
            this.notify(err.message, 'Error');
          });

    } else {

      this.departmentoService.add({ name: this.depName })
        .subscribe(
          (dep) => {
            this.notify('Department inserted!', 'Ok');
          }, 
          (err) => {
            console.error(err);
            this.notify(err.message, 'Error');
          });
    }

    this.clearForm();

  }

  clearForm() {
    this.depName = '';
    this.depEdit = null;
  }

  cancel() {
    this.clearForm();
  }

  edit(dep: Department) {

    this.depName = dep.name
    this.depEdit = dep;

  }

  delete(dep: Department) {

    this.departmentoService.delete(dep)
    .subscribe(
      () => this.notify('Department deleted', 'OK'), 
      (err) => this.notify(err.error.msg, 'Error')
    );

  }

  private notify(msg: string, title: string) {
    this.snackBar.open(msg, title, { duration: 3000 });
  }

  ngOnDestroy(): void {
    
    this.unsubscribe$.next();
  }

}
