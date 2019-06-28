import { NgModule } from '@angular/core';
import { Filter } from './filter';
import { ExcerptFilter } from './excerpt-filter';
@NgModule({
	declarations: [
	  Filter,
		ExcerptFilter,
	],
	imports: [],
	exports: [
	  Filter,
		ExcerptFilter,
	]
})
export class PipesModule {}
