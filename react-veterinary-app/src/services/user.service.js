import {apiUrl} from '../config'
import { authHeader} from '../helpers/auth-header';


export const userService = {
    login,
    logout,
    getAllMedics
}

async function login(email,password){
    const requestOptions = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email,password})
    };
    console.log(apiUrl);
    return fetch(`${apiUrl}api/Medic/authenticate`,requestOptions)
    .then(handleResponse)
    .then(user => {
        if(user)
        {
            user.authdata = window.btoa(email + ':' + password);
            localStorage.setItem('user',JSON.stringify(user));
        }
        return user;
    });
}

async function getAllMedics() {
    
    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };
    console.log(requestOptions.headers);
    return fetch(`${apiUrl}api/Medic`, requestOptions).then(handleResponse);
}

function logout() {
    localStorage.removeItem('user');
}

function handleResponse(response){
    return response.text().then(text => {
        const data = text && JSON.parse(text);
        console.log(data);
        if(!response.ok) {
            if(response.status === 401){
                //auto logout if unauthorized is received from api
                logout();
                window.location.reload(true);
            }
            const error = (data && data.message) || response.statusText;
            console.log("Text is: " + response.statusText);
            return Promise.reject(error);
        }
        return data;
    });
}