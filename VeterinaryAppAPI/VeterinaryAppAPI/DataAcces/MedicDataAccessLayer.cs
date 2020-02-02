using Google.Cloud.Firestore;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


namespace VeterinaryAppAPI
{
    public class MedicDataAccessLayer
    {
        string projectId;
        FirestoreDb fireStoreDb;
        public MedicDataAccessLayer()
        {
            string filepath = "E:\\Licenta\\FrontendVeterinaryApp\\FrontendVeterinaryApp\\Server\\Credentials\\final-year-project-748be-2df9641c0d90.json";
            Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", filepath);
            projectId = "final-year-project-748be";
            fireStoreDb = FirestoreDb.Create(projectId);
        }
        public async Task<List<Medic>> GetAllMedics()
        {
            try
            {
                Query MedicQuery = fireStoreDb.Collection("Medics");
                QuerySnapshot MedicQuerySnapshot = await MedicQuery.GetSnapshotAsync();
                List<Medic> lstMedic = new List<Medic>();
                List<Client> lstClient = new List<Client>();
                foreach (DocumentSnapshot documentSnapshot in MedicQuerySnapshot.Documents)
                {
                    if (documentSnapshot.Exists)
                    {
                        
                        Dictionary<string, object> medic = documentSnapshot.ToDictionary();
                        string json = JsonConvert.SerializeObject(medic);
                        Medic newMedic = JsonConvert.DeserializeObject<Medic>(json);
                        if (newMedic.Email.Equals("alex.andricsak@gmail.com") &&
                            newMedic.Password.Equals("Alexiso97"))
                        {
                            newMedic.Id = Convert.ToInt32(documentSnapshot.Id);
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
                                    newClient.Id = Convert.ToInt32(item.Id);
                                    lstClient.Add(newClient);
                                }
                            }
                            newMedic.Clients = lstClient;
                        }
                        //newMedic = documentSnapshot.CreateTime.Value.ToDateTime();
                        lstMedic.Add(newMedic);
                    }
                }
                List<Medic> sortedMedicList = lstMedic.OrderBy(x => x.Id).ToList();
                return sortedMedicList;
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
                    med.Id = Convert.ToInt32(snapshot.Id);
                    return med;
                }
                else
                {
                    return new Medic();
                }
            }
            catch
            {
                throw;
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
