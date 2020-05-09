import React,{ Component } from 'react';
import { medicService } from '../services/medic.service';
import { Table, Button, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash,faEdit,faPlusCircle} from '@fortawesome/free-solid-svg-icons';
import MaterialTable from 'material-table';


export class Settings extends Component{
    constructor(props){
        super(props)
        this.state={
            appointmentTypes:[],
            columnsHeader: [
                {title: 'Type' ,field: 'type'},
                {title:'Duration(minutes)',field:'duration',type:'numeric'},
                {title:'Price(euro)',field:'price',type:'numeric'}
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

    renderSettingsTable(){
        return(
            <Table striped bordered hover>
            <caption>List of services</caption>
            <thead>
                <tr>
                    <th scope="col">Type</th>
                    <th scope="col">Duration(minutes)</th>
                    <th scope="col">
                        <Button data-toggle="modal" variant="secondary">
                            <FontAwesomeIcon icon={faPlusCircle}/>
                            <span> Add new service</span>
                        </Button>
                    </th>
                </tr>
            </thead>
            <tbody>
                {this.state.appointmentTypes.map(appointmentType =>
                    <tr>
                        <td>{appointmentType.Type}</td>
                        <td>{appointmentType.Duration}</td>
                        <td>
                        <button className="btn" title="Edit" data-toggle="modal" data-target="#editModal"
                            ><FontAwesomeIcon icon={faEdit} color="blue"/>
                        </button> 
                        <button className="btn" title="Delete" data-toggle="modal" data-target="#deleteModal" 
                            ><FontAwesomeIcon icon={faTrash} color="red"/>
                        </button> 
                        </td>
                    </tr>
                )}
            </tbody>
            </Table>
        )
    }

    renderInventoryTable(){
        const columns = [
            {title: 'Category' ,field: 'category'},
        ];
        return(
            <MaterialTable
            title="Categories"
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
                title="Services"
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
                                <Card.Title>Options</Card.Title>
                            </Card.Header>
                            <Card.Body>
                                <div className="row justify-content-md-center" style={{marginBottom:'5%'}}>    
                                    <Button variant="secondary" name="services" onClick={(e) => this.handleClick(e)}>
                                        Services
                                    </Button>
                                </div>
                                <div className="row justify-content-md-center">
                                    <Button variant="secondary" name="inventory" onClick={(e) => this.handleClick(e)}>
                                        Inventory categories
                                    </Button>
                                </div>
                            </Card.Body>
                            <Card.Footer>
                                <Card.Text>Select one of those buttons to edit the afferent table.</Card.Text>
                            </Card.Footer>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }
}