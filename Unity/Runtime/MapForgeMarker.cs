using UnityEngine;

namespace SpireWrought.MapForge
{
    // Marker metadata exported by Map Forge. Game systems can query components by MarkerType.
    public sealed class MapForgeMarker : MonoBehaviour
    {
        public string MarkerId;
        public string MarkerType;
        public string Label;
        public string TargetId;
        public Vector2Int SourcePixel;
        public Vector2Int WorldCell;
    }
}