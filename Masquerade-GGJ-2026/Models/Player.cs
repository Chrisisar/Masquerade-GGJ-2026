namespace Masquerade_GGJ_2026.Models
{
    public class Player
    {
        public required string ConnectionId { get; set; }
        public string? Username { get; set; }
        public bool IsReady { get; set; }
    }
}