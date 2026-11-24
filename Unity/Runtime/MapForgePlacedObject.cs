using UnityEngine;

namespace SpireWrought.MapForge
{
    // Metadata for each placed visual object; imported composites contain baked artwork.
    public sealed class MapForgePlacedObject : MonoBehaviour
    {
        public string SourcePath;
        public string CollisionKind;
        public int FootPixelX;
        public int FootPixelY;
        public int SortingPixelY;
    }
}