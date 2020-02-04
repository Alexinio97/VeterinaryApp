using Firebase.Auth;
using Google.Cloud.Firestore;
using Microsoft.AspNetCore.Authentication;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;


namespace VeterinaryAppAPI
{
    public class MedicRepository
    {
        FirestoreDb fireStoreDb;
        public MedicRepository(FirestoreDb firestoreDb)
        {
            // configuration has been moved to startup
            this.fireStoreDb = firestoreDb;
        }

        public async Task<List<Client>> GetAllClientsAsync(string loggedUserId)
        {
            try
            {
                Query MedicQuery = fireStoreDb.Collection("Medics");
                QuerySnapshot MedicQuerySnapshot = await MedicQuery.GetSnapshotAsync();
                List<Client> lstClients = new List<Client>();
                foreach (DocumentSnapshot documentSnapshot in MedicQuerySnapshot.Documents)
                {
                    if (documentSnapshot.Exists)
                    {
                        
                        Dictionary<string, object> medic = documentSnapshot.ToDictionary();
                        string json = JsonConvert.SerializeObject(medic);
                        Medic newMedic = JsonConvert.DeserializeObject<Medic>(json);
                        newMedic.Id = documentSnapshot.Id;
                        
                        if (newMedic.Id.Equals(loggedUserId))
                        {
                            
                            // getting medic clients
                            CollectionReference Clients = fireStoreDb.Collection("Medics").Document(documentSnapshot.Id).Collection("Clients");
                            var result = Clients.GetSnapshotAsync().Result.Documents;
                            Console.WriteLine(result.Count);
                            foreach (var item in result)
                            {
                                if (item.Exists)
                                {
                                    
                                    Dictionary<string, object> client = item.ToDictionary();
                                    string jsonClient = JsonConvert.SerializeObject(client);
                                    Client newClient = JsonConvert.DeserializeObject<Client>(jsonClient);
                                    newClient.Id = item.Id;
                                    lstClients.Add(newClient);
                                }
                            }
                            break;
                        }
                        //newMedic = documentSnapshot.CreateTime.Value.ToDateTime();
                    }
                }
                return lstClients;
            }
            catch(Exception ex)
            {
                Console.WriteLine("Exception caught: " + ex.ToString());
                throw;
            }
        }

        


        public async void AddMedic(Medic Medic)
        {
            try
            {
                CollectionReference colRef = fireStoreDb.Collection("Medics");
                await colRef.AddAsync(Medic);
            }
            catch
            {
                throw;
            }
        }
        public async void UpdateMedic(Medic Medic)
        {
            try
            {
                DocumentReference empRef = fireStoreDb.Collection("Medics").Document(Convert.ToString(Medic.Id));
                await empRef.SetAsync(Medic, SetOptions.Overwrite);
            }
            catch
            {
                throw;
            }
        }
        public async Task<Medic> GetMedicData(string id)
        {
            try
            {
                DocumentReference docRef = fireStoreDb.Collection("Medics").Document(id);
                DocumentSnapshot snapshot = await docRef.GetSnapshotAsync();
                if (snapshot.Exists)
                {
                    Medic med = snapshot.ConvertTo<Medic>();
                    med.Id = snapshot.Id;
                    return med;
                }
                else
                {
                    return new Medic();
                }
            }
            catch(Exception ex)
            {
                Console.WriteLine("Exception caught: " + ex.ToString());
                return null;
            }
        }
        public async void DeleteMedic(string id)
        {
            try
            {
                DocumentReference empRef = fireStoreDb.Collection("Medics").Document(id);
                await empRef.DeleteAsync();
            }
            catch
            {
                throw;
            }
        }
        //public async Task<List<Cities>> GetCityData()
        //{
        //    try
        //    {
        //        Query citiesQuery = fireStoreDb.Collection("cities");
        //        QuerySnapshot citiesQuerySnapshot = await citiesQuery.GetSnapshotAsync();
        //        List<Cities> lstCity = new List<Cities>();
        //        foreach (DocumentSnapshot documentSnapshot in citiesQuerySnapshot.Documents)
        //        {
        //            if (documentSnapshot.Exists)
        //            {
        //                Dictionary<string, object> city = documentSnapshot.ToDictionary();
        //                string json = JsonConvert.SerializeObject(city);
        //                Cities newCity = JsonConvert.DeserializeObject<Cities>(json);
        //                lstCity.Add(newCity);
        //            }
        //        }
        //        return lstCity;
        //    }
        //    catch
        //    {
        //        throw;
        //    }
        //}
    }
}
