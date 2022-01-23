export class UIManager {
    public static setLoadingScreenVisible(value: boolean): void {
        document.getElementById('loading-screen').style.display = value ? 'flex' : 'none';
    }
}
