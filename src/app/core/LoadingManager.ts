import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { LoadingTrackerEntry } from './LoadingTrackerEntry';
import { Scenario } from '../world/Scenario';
import Swal from 'sweetalert2';
import { World } from '../world/World';
import { UiManagerService } from '../ui/ui-manager.service';

export class LoadingManager {
    public firstLoad = true;
    public onFinishedCallback: () => void;

    private world: World;
    private gltfLoader: GLTFLoader;
    private loadingTracker: LoadingTrackerEntry[] = [];

    constructor(world: World, private uiManagerService: UiManagerService) {
        this.world = world;
        this.gltfLoader = new GLTFLoader();

        this.world.setTimeScale(0);
        this.uiManagerService.displayLoadingScreen(true);
    }

    public loadGLTF(path: string, onLoadingFinished: (gltf: any) => void): void {
        const trackerEntry = this.addLoadingEntry(path);

        this.gltfLoader.load(path,
            (gltf) => {
                onLoadingFinished(gltf);
                this.doneLoading(trackerEntry);
            },
            (xhr) => {
                if (xhr.lengthComputable) {
                    trackerEntry.progress = xhr.loaded / xhr.total;
                }
            },
            (error) => {
                console.log('failed to load', path);
                console.error(error);
            });
    }

    public addLoadingEntry(path: string): LoadingTrackerEntry {
        const entry = new LoadingTrackerEntry(path);
        this.loadingTracker.push(entry);

        return entry;
    }

    public doneLoading(trackerEntry: LoadingTrackerEntry): void {
        trackerEntry.finished = true;
        trackerEntry.progress = 1;

        if (this.isLoadingDone()) {
            if (this.onFinishedCallback !== undefined) {
                this.onFinishedCallback();
            }

            this.uiManagerService.displayLoadingScreen(false);
        }
    }

    public createWelcomeScreenCallback(scenario: Scenario): void {
        if (this.onFinishedCallback === undefined) {
            this.onFinishedCallback = () => {
                this.world.update(1, 1);

                Swal.fire({
                    title: scenario.descriptionTitle,
                    html: scenario.descriptionContent,
                    confirmButtonText: 'Play',
                    buttonsStyling: false,
                    onClose: () => {
                        this.world.setTimeScale(1);
                    }
                });
            };
        }
    }

    private getLoadingPercentage(): number {
        let done = true;
        let total = 0;
        let finished = 0;

        for (const item of this.loadingTracker) {
            total++;
            finished += item.progress;
            if (!item.finished) done = false;
        }

        return (finished / total) * 100;
    }

    private isLoadingDone(): boolean {
        for (const entry of this.loadingTracker) {
            if (!entry.finished) return false;
        }
        return true;
    }
}
