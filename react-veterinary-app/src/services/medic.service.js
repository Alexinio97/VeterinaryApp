
import { db } from '../firebaseConfig/config';
import { auth } from 'firebase';
import {format, fromUnixTime, addDays, set} from 'date-fns';
export const medicService = {
    login,
    // logout,
    getAllClients,
    getMedicData,
    getAppointments
}

async function login(email,password){
    return auth().signInWithEmailAndPassword(email,password).then( () =>{
        var user = auth().currentUser;
        return user;
    } );
}

async function getAllClients() {
    var medicId = localStorage.getItem("medicId")
    var clients = []
    return db.collection('Medics').doc(medicId).collection("Clients").get().then( querySnapshot => {
        querySnapshot.forEach(function(doc) {
            var newClient = doc.data();
            newClient["Id"] = doc.id;
            clients.push(newClient);
        });
        return clients;
    }).catch( err => console.log(err));
}

async function getMedicData(Id)
{
    return db.collection('Medics').doc(Id).get().then( querySnapshot => {
        var medic = querySnapshot.data();
        return medic;
    }).catch( err => console.log(err));
}

async function getAppointments(day)
{
    day = set(day,{hours:0,minutes:0,seconds:0});

    let endDate = addDays(day,1);
    let appointments = [];
    let medicId = auth().currentUser.uid;
    let appointmentsRef = db.collection('Medics').doc(medicId).collection("Appointments");
    return appointmentsRef.where("startTime",">=",day).where("startTime","<",endDate)
    .get().then( querySnapshot => {
        querySnapshot.forEach( appointment =>{
            let newAppointment = appointment.data();
            newAppointment["Id"] = appointment.id;
            appointments.push(newAppointment);
        });
        return appointments;
    }).catch( err => console.log(err));
}

// function logout(state) {        
//     localStorage.removeItem('user');
//     state.changeState(false);
// }

// function handleResponse(response){
//     return response.text().then(text => {
//         const data = text && JSON.parse(text);
//         console.log(data);
//         if(!response.ok) {
//             if(response.status === 401){
//                 //auto logout if unauthorized is received from api
//                 logout();
//                 window.location.reload(true);
//             }
//             const error = (data && data.message) || response.statusText;
//             console.log("Text is: " + response.statusText);
//             return Promise.reject(error);
//         }
//         return data;
//     });
// }