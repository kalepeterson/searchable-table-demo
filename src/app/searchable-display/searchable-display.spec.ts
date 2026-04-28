import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchableDisplay } from './searchable-display';

describe('SearchableDisplay', () => {
	let component: SearchableDisplay;
	let fixture: ComponentFixture<SearchableDisplay>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [SearchableDisplay],
		}).compileComponents();

		fixture = TestBed.createComponent(SearchableDisplay);
		component = fixture.componentInstance;
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
