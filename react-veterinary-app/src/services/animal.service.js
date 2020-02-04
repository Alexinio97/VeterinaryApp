import {apiUrl} from '../config'
import { authHeader} from '../helpers/auth-header';


export const animalService = {
    getUsersAnimals
}


async function getUsersAnimals(clientId) {
    
    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };
    console.log(requestOptions.headers);
    return fetch(`${apiUrl}api/Animal/${clientId}/Animals`, requestOptions).then(handleResponse);
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