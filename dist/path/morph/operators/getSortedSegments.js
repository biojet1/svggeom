import { perimeterPoints } from './perimeterPoints';
export function getSortedSegments(pathSegments) {
    return pathSegments
        .map((points) => ({
        points,
        perimeter: perimeterPoints(points)
    }))
        .sort((a, b) => b.perimeter - a.perimeter)
        .map((a) => a.points);
}
