import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnDefHeaders } from './column-def-headers';

describe('ColumnDefHeaders', () => {
	let component: ColumnDefHeaders;
	let fixture: ComponentFixture<ColumnDefHeaders>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ColumnDefHeaders],
		}).compileComponents();

		fixture = TestBed.createComponent(ColumnDefHeaders);
		component = fixture.componentInstance;
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
