using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Firebase;
using Firebase.Auth;
using VeterinaryAppAPI.Models;
using Microsoft.AspNetCore.Authentication;
using VeterinaryAppAPI.Helpers;
using VeterinaryAppAPI.Services;
using Google.Cloud.Firestore;
using VeterinaryAppAPI.DataAcces;

namespace VeterinaryAppAPI
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }
        
        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // firebase object
            string filepath = "E:\\Licenta\\FrontendVeterinaryApp\\FrontendVeterinaryApp\\Server\\Credentials\\final-year-project-748be-2df9641c0d90.json";
            Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", filepath);
            string projectId = "final-year-project-748be";
            FirestoreDb fireStoreDb = FirestoreDb.Create(projectId);

            services.AddSingleton<FirestoreDb>(fireStoreDb);
            // repositories
            services.AddSingleton<MedicRepository>(new MedicRepository(fireStoreDb));
            services.AddSingleton<AnimalRepository>(new AnimalRepository(fireStoreDb));

            services.AddCors();
            services.AddControllers();
            services.AddAuthentication("FirebaseAuthentication")
                .AddScheme<AuthenticationSchemeOptions, FirebaseAuthenticationHandler>("FirebaseAuthentication", null);
            services.AddScoped<IUserService, UserService>();
            
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            app.UseRouting();
            app.UseCors(x => x
                .AllowAnyOrigin()
                .AllowAnyMethod()
                .AllowAnyHeader());

            app.UseAuthentication();
            app.UseAuthorization();
            
            
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
            
        }

        
        
    }
}
