import { Component, ViewChild, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { fromEvent, Subscription, interval, timer, Observable } from 'rxjs';
import { debounceTime, tap, debounce, bufferCount, bufferTime, take, buffer, throttleTime, filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnDestroy {
  public isRunning = false;
  private isPaused = false;
  public time = '00:00:00';
  private startTime = 0;
  private stopTime = 0;

  private btnWaitSubscr: Subscription;
  private timerSubscr: Subscription;

  @ViewChild('wait') btnWait: ElementRef;

  ngAfterViewInit() {
    const clicks$ = fromEvent<Event>(this.btnWait.nativeElement, 'click');
    clicks$.pipe(
      buffer(clicks$.pipe(debounceTime(300))),
      filter(clickArray => {
        return clickArray.length > 1;
      })
  )
  .subscribe(() => {
      // console.log('dblckick');
      if (!this.isPaused && this.isRunning) {
        this.isPaused = true;
        this.isRunning = false;
        this.timerSubscr.unsubscribe();
      }
  });


  }

  public start(): void {
    this.isPaused = false;
    this.isRunning = true;
    this.startTime = Date.now() - (this.stopTime || 0);
    this.timerSubscr = interval(1000).pipe(
      tap(() => {
          this.clockRunning();
      })
    ).subscribe();
  }

  public stop(): void {
    this.isRunning = false;
    this.stopTime = 0;
    this.time = '00:00:00';
    this.timerSubscr.unsubscribe();
  }

  public reset(): void {
    if (this.isRunning || this.isPaused) {
      this.stop();
      this.start();
    }
  }

  private zeroPrefix(num: any) {
    return (num < 10) ? ('0' + num) : num;
  }
  private clockRunning() {
    this.stopTime = Date.now() - this.startTime;
    const currentTime: any = new Date();
    const timeElapsed: any = new Date(currentTime - this.startTime);
    const hh = timeElapsed.getUTCHours();
    const mm = timeElapsed.getUTCMinutes();
    const ss = timeElapsed.getUTCSeconds();

    this.time = `${this.zeroPrefix(hh)}:${this.zeroPrefix(mm)}:${this.zeroPrefix(ss)}`;
  }

  ngOnDestroy(): void {
    this.btnWaitSubscr.unsubscribe();
    this.timerSubscr.unsubscribe();
  }
}
