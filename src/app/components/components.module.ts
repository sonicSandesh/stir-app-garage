import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { UploadBoxComponent } from './upload-box/upload-box.component';
@NgModule({
	declarations: [
		UploadBoxComponent
	],
	imports: [
		CommonModule,
		IonicModule,
	],
	exports: [
		UploadBoxComponent
	]
})
export class ComponentsModule {}
