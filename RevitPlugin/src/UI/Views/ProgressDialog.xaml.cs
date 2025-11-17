using System;
using System.Windows;

namespace BlockPlane.RevitPlugin.UI.Views
{
    /// <summary>
    /// Progress Dialog - Shows progress for long-running operations
    /// </summary>
    public partial class ProgressDialog : Window
    {
        public ProgressDialog(string title = "Processing")
        {
            InitializeComponent();
            
            TitleText.Text = title;
            ProgressBar.IsIndeterminate = false;
        }

        /// <summary>
        /// Update progress with percentage and status message
        /// </summary>
        public void UpdateProgress(int percentage, string statusMessage = null)
        {
            if (percentage < 0 || percentage > 100)
            {
                throw new ArgumentOutOfRangeException(nameof(percentage), "Percentage must be between 0 and 100");
            }

            Dispatcher.Invoke(() =>
            {
                ProgressBar.Value = percentage;
                PercentageText.Text = $"{percentage}%";

                if (!string.IsNullOrWhiteSpace(statusMessage))
                {
                    StatusText.Text = statusMessage;
                }
            });
        }

        /// <summary>
        /// Set indeterminate progress mode (for unknown duration)
        /// </summary>
        public void SetIndeterminate(string statusMessage = "Please wait...")
        {
            Dispatcher.Invoke(() =>
            {
                ProgressBar.IsIndeterminate = true;
                PercentageText.Visibility = Visibility.Collapsed;
                StatusText.Text = statusMessage;
            });
        }

        /// <summary>
        /// Set determinate progress mode (for known duration)
        /// </summary>
        public void SetDeterminate()
        {
            Dispatcher.Invoke(() =>
            {
                ProgressBar.IsIndeterminate = false;
                PercentageText.Visibility = Visibility.Visible;
            });
        }

        /// <summary>
        /// Update status message only
        /// </summary>
        public void UpdateStatus(string statusMessage)
        {
            Dispatcher.Invoke(() =>
            {
                StatusText.Text = statusMessage;
            });
        }

        /// <summary>
        /// Complete the operation and close dialog
        /// </summary>
        public void Complete(string completionMessage = "Complete!")
        {
            Dispatcher.Invoke(() =>
            {
                UpdateProgress(100, completionMessage);
                System.Threading.Thread.Sleep(500); // Brief pause to show completion
                DialogResult = true;
                Close();
            });
        }

        /// <summary>
        /// Cancel the operation and close dialog
        /// </summary>
        public void Cancel(string cancellationMessage = "Cancelled")
        {
            Dispatcher.Invoke(() =>
            {
                StatusText.Text = cancellationMessage;
                DialogResult = false;
                Close();
            });
        }
    }
}
