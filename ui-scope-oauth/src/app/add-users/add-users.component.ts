import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NotificationsService } from '../Services/notifications.service';

declare var config: any; //Lectura dinamica del archivo de configuracion.

//Interface para definier objetos de tipo USUARIOS.
export interface USERS {
  display: string;
  value: string;
}

@Component({
  selector: 'app-add-users',
  templateUrl: './add-users.component.html',
  styleUrls: ['./add-users.component.scss']
})
export class AddUsersComponent implements OnInit {
  @ViewChild('TableOnePaginator', { static: true }) paginator1!: MatPaginator; //Objeto para el paginador de la tabla1.
  @ViewChild('TableTwoPaginator', { static: true }) paginator2!: MatPaginator; //Objeto para el paginador de la tabla2.


  displayedColumns: string[] = ['display', 'value', 'acciones']; //Variable para traer datos hacia las columnas de las tablas.
  dataSource1!: MatTableDataSource<USERS>;  //Variable de tabla para almacenar datos de USUARIOS provenientes de WSO2 IS.
  dataSource2!: MatTableDataSource<USERS>;  //Variable de tabla para almacenar datos de USUARIOS provenientes del ROL.

  data1: any[] = []; //Variable para almacenar datos de USUARIOS provenientes de WSO2 IS.
  data2: any[] = []; //Variable para almacenar datos de USUARIOS que se van a enviar al ROL.

  constructor(public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: any, private notify: NotificationsService, private http: HttpClient, public dialogRef: MatDialogRef<AddUsersComponent>) {
    this.data2 = data.data; //Obtengo los usuarios actuales
  }

  ngOnInit(): void {
    this.traerDatosUsers(); //Traigo los usuarios desde WSO2 IS.
    this.updateDataSource2(); //Actualizo los datos de la tabla de usuarios actuales.
  }

  //Traer datos de Usuarios desde WSO2 IS
  traerDatosUsers() {
    this.http.get(config.urlSCIM2 + "Users").subscribe((users: any) => {
      //Para cada usuario obtengo solo los datos necesarios. Son muchos.
      users.Resources.forEach((element: any) => {
        let u: USERS = { display: element.userName, value: element.id };
        this.data1.push(u);
      });
      this.updateDataSource1(); //Actualizo los datos de la tabla Usuarios disponibles.
    },
      error => {
        console.log(error);
      });
  }

  //Filtro para la tabla de Usuarios disponibles.
  applyFilter1(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource1.filter = filterValue.trim().toLowerCase();

    if (this.dataSource1.paginator) {
      this.dataSource1.paginator.firstPage();
    }
  }

  //Filtro para la tabla de Usuarios actuales.
  applyFilter2(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();

    if (this.dataSource2.paginator) {
      this.dataSource2.paginator.firstPage();
    }
  }

  //Metodso para actualizar tabla Usuarios disponibles.
  updateDataSource1() {
    this.dataSource1 = new MatTableDataSource<USERS>(this.data1);
    this.dataSource1.paginator = this.paginator1;
  }

  //Metodso para actualizar tabla Usuarios actuales.
  updateDataSource2() {
    this.dataSource2 = new MatTableDataSource<USERS>(this.data2);
    this.dataSource2.paginator = this.paginator2;
  }

  //Metodo para nuevos agregar usuarios a ROL
  add(row?: any) {
    //Valido si usuario existe en el ROL.
    let result: any = this.data2.filter(function (data2) { return data2.display === row.display }); 

    if (result.length != 0) {
      this.notify.warning("'" + row.display + "' ya fue seleccionado");
    }
    else { //Si el usuario no existe lo agrego.
      this.data2.push(row);
      this.updateDataSource2();
    }
  }

  //Metodo para eliminar los usuarios del ROL.
  delete(row?: any) {
    if (this.data2.length > 1) { //Valido que quede al menos un usuario en el ROL.
      this.data2.splice(this.data2.indexOf(row), 1);
      this.updateDataSource2();
    }
    else {
      this.notify.error("Los ROLES no pueden permanecer sin usuarios");
    }
  }

  //Metodo para enviar los usuarios modificados al ROL.
  enviar() {
    this.dialogRef.close(this.data2);
  }

}
