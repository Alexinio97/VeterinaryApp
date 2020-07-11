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
using Firebase.Storage;
using VetClientMobileApp.Activities;
using VetClientMobileApp.EventListeners;
using VetClientMobileApp.Models;
using VetClientMobileApp.Services;

namespace VetClientMobileApp.Adapter
{
    class InvoiceAdapter : BaseAdapter<Invoice>
    {
        Invoice[] _invoices;
        Activity _context;
        ImageButton deleteInvoice;
        bool _isShowed = false;
        public InvoiceAdapter(Activity context, Invoice[] invoices)
        {
            _context = context;
            _invoices = invoices;
        }

        public override Invoice this[int position] => _invoices[position];

        public override int Count => _invoices.Count();

        public override long GetItemId(int position)
        {
            return position;
        }

        public override View GetView(int position, View convertView, ViewGroup parent)
        {
            View view = convertView;
            if (view == null)
                view = _context.LayoutInflater.Inflate(Resource.Layout.invoice_item, null);
            view.FindViewById<TextView>(Resource.Id.invoice_name).Text = _invoices[position].InvoiceName;
            deleteInvoice = view.FindViewById<ImageButton>(Resource.Id.deleteInvoice_btn);

            var invoiceToDelete = _invoices[position].Id;
            deleteInvoice.SetTag(deleteInvoice.Id, invoiceToDelete);
            deleteInvoice.SetFocusable(ViewFocusability.NotFocusable);
            deleteInvoice.FocusableInTouchMode = false;
            deleteInvoice.Click += DeleteInvoice_Click; ;
            return view;
        }

        private void DeleteInvoice_Click(object sender, EventArgs e)
        {
            // get services;
            UserService userService = new UserService();
            FirebaseStorage firebaseStorage = userService.GetStorage(_context);
            var firestoreDb = userService.GetDatabase(_context);
            // get local storage service

            View receivedView = (View)sender;
            var invoiceId = receivedView.GetTag(deleteInvoice.Id);
            Console.WriteLine("Button clicked.");
            TaskCompletionListener completionListener = new TaskCompletionListener();
            completionListener.Succes += CompletionListener_Succes;
            completionListener.Failure += CompletionListener_Failure;

            

            var deleteInvoiceAlert = new AlertDialog.Builder(_context);
            if (_isShowed != true)
            {
                _isShowed = true;
                deleteInvoiceAlert.SetTitle("Stergeti factura");
                deleteInvoiceAlert.SetMessage($"Sunteti sigur ca doriti sa stergeti aceasta factura?");
                deleteInvoiceAlert.SetPositiveButton("Da", async delegate
                {
                    StorageService storage = new StorageService();
                    var clientLogged = await storage.GetClientDataLocal();
                    firestoreDb.Collection("Medics").Document(clientLogged.MedicSubscribed.Id).Collection("Clients").Document(clientLogged.Id).Collection("Invoices")
                    .Document(invoiceId.ToString())
                    .Delete().AddOnSuccessListener(completionListener).AddOnFailureListener(completionListener);

                    // delete invoice also from list
                    List<Invoice> invoicesList = _invoices.ToList<Invoice>();
                    var invoiceToDelete = invoicesList.FirstOrDefault(appoint => appoint.Id.Equals(invoiceId.ToString()));
                    // delete invoice from storage also
                    await firebaseStorage.Reference.Child(clientLogged.Id).Child(invoiceToDelete.InvoiceName).DeleteAsync();
                    invoicesList.Remove(invoiceToDelete);

                    _invoices = invoicesList.ToArray();
                    _isShowed = false;
                    deleteInvoiceAlert.Dispose();
                    _context.Finish();
                    _context.StartActivity(typeof(ClientInvoicesActivity));
                });
                deleteInvoiceAlert.SetNegativeButton("Nu", delegate
                {
                    _isShowed = false;
                    deleteInvoiceAlert.Dispose();
                });
                deleteInvoiceAlert.Show();
            }
        }

        private void CompletionListener_Failure(object sender, EventArgs e)
        {
            var exception = (Java.Lang.Exception)sender;
            Console.WriteLine(exception.ToString());
        }

        private void CompletionListener_Succes(object sender, EventArgs e)
        {
            Console.WriteLine("Succes!");
        }
    }
}