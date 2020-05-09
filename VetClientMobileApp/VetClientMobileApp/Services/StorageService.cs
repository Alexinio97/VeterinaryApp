using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Android.App;
using Android.Content;
using Android.OS;
using Android.Runtime;
using Android.Views;
using Android.Widget;
using Newtonsoft.Json;
using PCLStorage;
using VetClientMobileApp.Models;

namespace VetClientMobileApp.Services
{
    class StorageService
    {
        public async Task SaveClientDataLocal(Client client)
        {
            IFolder rootFolder = FileSystem.Current.LocalStorage;
            IFolder folder = await rootFolder.CreateFolderAsync("DailyVetData",
                CreationCollisionOption.OpenIfExists);
            IFile file = await folder.CreateFileAsync("client.json",
                CreationCollisionOption.ReplaceExisting);
            var jsonClient = JsonConvert.SerializeObject(client);
            await file.WriteAllTextAsync(jsonClient);
        }

        public async Task<Client> GetClientDataLocal()
        {
            IFolder rootFolder = FileSystem.Current.LocalStorage;
            IFolder folder = await rootFolder.CreateFolderAsync("DailyVetData",
                CreationCollisionOption.OpenIfExists);
            IFile file = await folder.GetFileAsync("client.json");
            var clientJson = await file.ReadAllTextAsync();
            Client receivedClient = JsonConvert.DeserializeObject<Client>(clientJson);
            return receivedClient;
        }
    }
}