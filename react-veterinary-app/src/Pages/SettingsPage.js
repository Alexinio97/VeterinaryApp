import React,{ Component } from 'react';
import { medicService } from '../services/medic.service';
import { Button, Card } from 'react-bootstrap';
import MaterialTable from 'material-table';


export class Settings extends Component{
    constructor(props){
        super(props)
        this.state={
            appointmentTypes:[],
            columnsHeader: [
                {title: 'Tip' ,field: 'type'},
                {title:'Durata(minute)',field:'duration',type:'numeric'},
                {title:'Pret(lei)',field:'price',type:'numeric'}
            ],
            renderServices:true, // if renderServices is falls it will render the Inventory table
            categories:[],
        }
        this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount(){
        this.populateAppointmentTypes();
    }

    async populateAppointmentTypes(){
        await medicService.getAppointmentTypes().then(appointmentTypes => this.setState({appointmentTypes:appointmentTypes}));
    }

    async populateCategories(){
        await medicService.getCategories().then(categories => this.setState({categories:categories}));
    }

    renderInventoryTable(){
        const columns = [
            {title: 'Categorie' ,field: 'category'},
        ];
        return(
            <MaterialTable
            title="Categorii"
            columns={columns}
            data={this.state.categories}
            editable={{
                    onRowAdd: (newCategory) =>
                    new Promise((resolve) =>
                    setTimeout(() =>
                    {
                        resolve();
                        medicService.addCategory(newCategory);
                        return this.populateCategories();
                    },600)),
                    onRowUpdate: (newCategory,oldCategory) =>
                    new Promise((resolve) => 
                    setTimeout(() =>{
                        resolve();
                        medicService.updateCategory(newCategory);
                        return this.populateCategories();
                    },600)),
                    onRowDelete: (oldCategory) =>
                    new Promise((resolve) =>
                    setTimeout(() => {
                        resolve();
                        medicService.deleteCategory(oldCategory);
                        return this.populateCategories();
                    },600)
                    )
                }}
            />
        )
    }

    renderMaterialTable(){
        console.log(this.state.appointmentTypes);
        return(
            <MaterialTable
                title="Servicii"
                columns={this.state.columnsHeader}
                data={this.state.appointmentTypes}
                editable={{
                    onRowAdd: (newAppType) =>
                    new Promise((resolve) =>
                    setTimeout(() =>
                    {
                        resolve();
                        medicService.addAppType(newAppType);
                        return this.populateAppointmentTypes();
                    },600)),
                    onRowUpdate: (newApp,oldApp) =>
                    new Promise((resolve) => 
                    setTimeout(() =>{
                        resolve();
                        medicService.updateAppType(newApp);
                        return this.populateAppointmentTypes();
                    },600)),
                    onRowDelete: (oldApp) =>
                    new Promise((resolve) =>
                    setTimeout(() => {
                        resolve();
                        medicService.deleteAppType(oldApp);
                        return this.populateAppointmentTypes();
                    },600)
                    )
                }}
            />
        )
    }

    handleClick(e){
        let buttonName = e.target.name;
        if(buttonName === "services" && this.state.renderServices !== true){
            this.setState({renderServices:true});
        }
        if(buttonName === "inventory" && this.state.renderServices === true){
            if(this.state.categories.length <= 0)
            {
                console.log("Populating categories.");
                this.populateCategories();
            }
            this.setState({renderServices:false});
        }
    }

    render(){

        return(
            <div className="container">
                <div className="row">
                    <div className="col-md-9">
                        {(this.state.renderServices) ? this.renderMaterialTable() : this.renderInventoryTable()}
                    </div>
                    <div className="col-md-3">
                        <Card>
                            <Card.Header>
                                <Card.Title>Optiuni</Card.Title>
                            </Card.Header>
                            <Card.Body>
                                <div className="row justify-content-md-center" style={{marginBottom:'5%'}}>    
                                    <Button variant="secondary" name="services" onClick={(e) => this.handleClick(e)}>
                                        Servicii
                                    </Button>
                                </div>
                                <div className="row justify-content-md-center">
                                    <Button variant="secondary" name="inventory" onClick={(e) => this.handleClick(e)}>
                                        Categorii inventar
                                    </Button>
                                </div>
                            </Card.Body>
                            <Card.Footer>
                                <Card.Text>Selectati unul dintre butoane pentru a edita tabelul aferent.</Card.Text>
                            </Card.Footer>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }
}