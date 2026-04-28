import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnDefBody } from './column-def-body';

describe('ColumnDefBody', () => {
	let component: ColumnDefBody;
	let fixture: ComponentFixture<ColumnDefBody>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ColumnDefBody],
		}).compileComponents();

		fixture = TestBed.createComponent(ColumnDefBody);
		component = fixture.componentInstance;
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
