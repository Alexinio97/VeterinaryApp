import React,{Component} from 'react';
import MaterialTable from 'material-table';
import { medicService } from '../../services/medic.service';
import { inventoryService } from '../../services/inventory.service';

export class Inventory extends Component{
    constructor(props){
        super(props);
        this.state={
            items:[],
            categories:[],
        }
    }

    componentDidMount(){
        this.populateCategories();
        this.populateInventoryItems();
    }

    async populateInventoryItems(){
        await inventoryService.getInventoryItems().then(items => this.setState({items:items}));
    }
    
    async populateCategories(){
        await medicService.getCategories().then(categories => this.setState({categories:categories}));
    }

    renderInventoryTable(){
        let categoryLookup = {};
        this.state.categories.map(category =>{
            let name = category.category;
            categoryLookup[name] = category.category;
        });
        console.log(categoryLookup);
        const columns=[
            {title:'Nume',field:'name'},
            {title:'Categorie',field:'category',
            lookup:categoryLookup},
            {title:'Indicatii',field:'indications'},
            {title:'Cantitate(g)',field:'quantity',type:'numeric'}
        ];
        return(
            <MaterialTable
                title="Stoc medical"
                columns={columns}
                data={this.state.items}
                editable={{
                    onRowAdd: (newItem) =>
                    new Promise((resolve) =>
                    setTimeout(() =>
                    {
                        resolve();
                        inventoryService.addInventoryItem(newItem);
                        return this.populateInventoryItems();
                    },600)),
                    onRowUpdate: (newItem,oldItem) =>
                    new Promise((resolve) => 
                    setTimeout(() =>{
                        resolve();
                        inventoryService.updateInventoryItem(newItem);
                        return this.populateInventoryItems();
                    },600)),
                    onRowDelete: (oldItem) =>
                    new Promise((resolve) =>
                    setTimeout(() => {
                        resolve();
                        inventoryService.deleteInventoryItem(oldItem);
                        return this.populateInventoryItems();
                    },600)
                    )
                }}
            />
        )
    }
    
    render(){
        return(
            <div className="container">
                {this.renderInventoryTable()}
            </div>
        )
    }
}
