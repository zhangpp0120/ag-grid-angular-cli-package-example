import {Component, ViewChild, ViewContainerRef} from "@angular/core";
import {ColumnApi, GridApi} from "ag-grid-community";
import {AgGridModule, ICellEditorAngularComp} from "ag-grid-angular";
import { TestBed, waitForAsync } from "@angular/core/testing";
import {FormsModule} from "@angular/forms";

@Component({
    template: `
        <span>{{this.params.value * 2}}</span>`
})
class RendererComponent {
    params: any;

    public agInit(params) {
        this.params = params;
    }
}


@Component({
    selector: 'editor-cell',
    template: `<input #input [(ngModel)]="value" style="width: 100%">`
})
export class EditorComponent implements ICellEditorAngularComp {
    private params: any;
    public value: number;

    @ViewChild('input', {read: ViewContainerRef, static: false}) public input;

    agInit(params: any): void {
        this.params = params;
        this.value = this.params.value;
    }

    getValue(): any {
        return this.value;
    }

    // for testing
    setValue(newValue: any) {
        this.value = newValue;
    }

    isCancelBeforeStart(): boolean {
        return false;
    }

    isCancelAfterEnd(): boolean {
        return false;
    };
}

@Component({
    template: `
        <div>
            <ag-grid-angular style="width: 100%; height: 350px;" class="ag-theme-balham"
                             [columnDefs]="columnDefs"
                             [rowData]="rowData"

                             [stopEditingWhenCellsLoseFocus]="false"

                             (gridReady)="onGridReady($event)">
            </ag-grid-angular>
        </div>`
})
class TestHostComponent {
    rowData: any[] = [{name: 'Test Name', number: 42}];

    columnDefs: any[] = [
        {field: "name"},
        {field: "number", colId: "raw", headerName: "Raw Number", editable: true, cellEditor: EditorComponent},
        {field: "number", colId: "renderer", headerName: "Renderer Value", cellRenderer: RendererComponent}
    ];

    api: GridApi;
    columnApi: ColumnApi;

    public onGridReady(params) {
        this.api = params.api;
        this.columnApi = params.columnApi;
    }
}

describe('angular-cli App', function () {
    let fixture: any;
    let component: TestHostComponent;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                AgGridModule
            ],
            declarations: [TestHostComponent, RendererComponent, EditorComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    }));

    it('the application should render', () => {
        expect(component).toBeDefined();
    });

    it('the grid cells should be as expected', () => {
        const appElement = fixture.nativeElement;

        const cellElements = appElement.querySelectorAll('.ag-cell-value');
        expect(cellElements.length).toEqual(3);
        expect(cellElements[0].textContent).toEqual("Test Name");
        expect(cellElements[1].textContent).toEqual("42");
        expect(cellElements[2].textContent).toEqual("84");
    });

    // it('cell should be editable and editor component usable', () => {
    //     // we use the API to start and stop editing - in a real e2e test we could actually double click on the cell etc
    //     component.api.startEditingCell({
    //         rowIndex: 0,
    //         colKey: 'raw'
    //     });
    //
    //     const instances = component.api.getCellEditorInstances();
    //     expect(instances.length).toEqual(1);
    //
    //     const editorComponent = instances[0].getFrameworkComponentInstance();
    //     editorComponent.setValue(100);
    //
    //     component.api.stopEditing();
    //
    //     const appElement = fixture.nativeElement;
    //     const cellElements = appElement.querySelectorAll('.ag-cell-value');
    //     expect(cellElements.length).toEqual(3);
    //     expect(cellElements[0].textContent).toEqual("Test Name");
    //     expect(cellElements[1].textContent).toEqual("100");
    //     expect(cellElements[2].textContent).toEqual("200");
    // });
});
