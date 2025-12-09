import { Component } from '@angular/core';
import { WeeklyTable } from './components/weekly-table/weekly-table';
import { FeedbackForm } from './components/feedback-form/feedback-form';
import { ProgressCard } from './components/progress-card/progress-card';

@Component({
  selector: 'app-training',
  standalone: true,
  imports: [WeeklyTable, FeedbackForm, ProgressCard],
  templateUrl: './training.html',
  styleUrl: './training.scss',
})
export class Training {

}
