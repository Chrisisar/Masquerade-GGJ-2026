namespace Masquerade_GGJ_2026.Hubs
{
    using Microsoft.AspNetCore.SignalR;
    using System;
    using System.Threading.Tasks;

    {
        public override async Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();
            var username = httpContext?.Request.Query["username"].ToString();
            if (!string.IsNullOrEmpty(username))
            {
                Context.Items["username"] = username;
            }

            await Clients.All.SendAsync("UserJoined", Context.ConnectionId, username);
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var username = Context.Items.ContainsKey("username") ? Context.Items["username"]?.ToString() : null;
            await Clients.All.SendAsync("UserLeft", Context.ConnectionId, username);
            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessage(string message)
        {
            // odpowiedź po 15 sekundach tylko do nadawcy
            await Task.Delay(15_000);
        }
    }
}
