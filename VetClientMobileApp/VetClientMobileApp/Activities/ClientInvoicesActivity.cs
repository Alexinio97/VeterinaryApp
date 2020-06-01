using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using Android.App;
using Android.Content;
using Android.OS;
using Android.Runtime;
using Android.Views;
using Android.Widget;
using Firebase.Auth;
using Firebase.Firestore;
using Firebase.Storage;
using VetClientMobileApp.Adapter;
using VetClientMobileApp.EventListeners;
using VetClientMobileApp.Models;
using VetClientMobileApp.Services;

namespace VetClientMobileApp.Activities
{
    [Activity(Label = "ClientInvoicesActivity")]
    public class ClientInvoicesActivity : Activity
    {
        private FirebaseStorage firebaseStorage;
        private IUserService _userService;
        private readonly StorageService _localStorage;
        private Client clientLogged;
        private FirebaseFirestore _firestoreDb;
        private ListView invoicesList;
        private List<Invoice> invoices;
        public ClientInvoicesActivity()
        {
            _userService = new UserService();
            _localStorage = new StorageService();
            invoices = new List<Invoice>();
        }
        protected override async void OnCreate(Bundle savedInstanceState)
        {
            base.OnCreate(savedInstanceState);
            SetContentView(Resource.Layout.invoices_main);
            clientLogged = await _localStorage.GetClientDataLocal();
            _firestoreDb = _userService.GetDatabase(this);
            firebaseStorage = _userService.GetStorage(this);

            
            invoicesList = FindViewById<ListView>(Resource.Id.lstView_Invoices);
            GetInvoicesNames();
        }

        public void GetInvoicesNames()
        {
            
            try
            {
                TaskCompletionListener invoicesListener = new TaskCompletionListener();
                invoicesListener.Succes += InvoicesListener_Succes;
                invoicesListener.Failure += InvoicesListener_Failure;
                _firestoreDb.Collection("Medics").Document(clientLogged.MedicSubscribed.Id).Collection("Clients").Document(clientLogged.Id).Collection("Invoices")
                    .Get().AddOnSuccessListener(invoicesListener).AddOnFailureListener(invoicesListener);
            }
            catch(Exception ex)
            {
                Console.WriteLine("Error fetching invoices!",ex.ToString());
            }
   
        }

        private void InvoicesListener_Failure(object sender, EventArgs e)
        {
            Console.WriteLine("Exception caught!");
        }

        private void InvoicesListener_Succes(object sender, EventArgs e)
        {
            var snapshot = (QuerySnapshot)sender;

            if (!snapshot.IsEmpty)
            {
                var documents = snapshot.Documents;

                invoices.Clear();
                foreach (var document in documents)
                {
                    Invoice newInvoice = new Invoice();
                    
                    newInvoice.InvoiceName = document.GetString("Invoice");
                    newInvoice.Id = document.Id;
                    invoices.Add(newInvoice);
                }
                invoicesList.Adapter = new InvoiceAdapter(this, invoices.ToArray());
                invoicesList.ItemClick += InvoicesList_ItemClick;
            }
        }

        private async void InvoicesList_ItemClick(object sender, AdapterView.ItemClickEventArgs e)
        {
            string invoiceName = invoices[e.Position].InvoiceName;
            var url = await firebaseStorage.Reference.Child(clientLogged.Id).Child(invoiceName).GetDownloadUrlAsync();
            var downloadRes = DownloadInvoice(this, url, invoiceName);
        }

        private long DownloadInvoice(Context context,Android.Net.Uri uri,string fileName)
        {
            DownloadManager downloadManager = DownloadManager.FromContext(context);
            var request = new DownloadManager.Request(uri);

            request.SetNotificationVisibility(DownloadVisibility.VisibleNotifyCompleted);
            request.SetDestinationInExternalFilesDir(context, Android.OS.Environment.DirectoryDownloads,fileName + ".pdf");
            return downloadManager.Enqueue(request);
        }
    }
}