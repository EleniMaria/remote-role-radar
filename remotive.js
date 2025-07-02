const apiUrl = 'https://remoteok.com/api';
const jobContainer = document.getElementById('job-listings');
const trackedTable = document.getElementById('tracked-jobs');
const toggle = document.getElementById('theme-toggle');
toggle.addEventListener('change', () => {
  document.body.classList.toggle('dark-mode');
});

// Utility functions for localStorage
function loadTrackedJobs() {
  const stored = localStorage.getItem('trackedJobs');
  return stored ? JSON.parse(stored) : [];
}

function saveTrackedJobs(jobs) {
  localStorage.setItem('trackedJobs', JSON.stringify(jobs));
}

// Render saved jobs into tracker table
function renderTrackedJobs() {
  trackedTable.innerHTML = ''; // Clear table body
  const trackedJobs = loadTrackedJobs();

  trackedJobs.forEach((job, index) => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${job.company}</td>
      <td>${job.title}</td>
      <td>
        <select>
          <option ${job.status === 'Saved' ? 'selected' : ''}>Saved</option>
          <option ${job.status === 'Applied' ? 'selected' : ''}>Applied</option>
          <option ${job.status === 'Interviewing' ? 'selected' : ''}>Interviewing</option>
          <option ${job.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
        </select>
      </td>
      <td><input type="date" value="${job.dateApplied || ''}"></td>
      <td><input type="date" value="${job.followUpDate || ''}"></td>
      <td><input type="text" value="${job.notes || ''}"></td>
      <td><a href="${job.url}" target="_blank">View</a></td>
      <td><button class="delete-btn" data-index="${index}">🗑️</button></td>
    `;

    trackedTable.appendChild(row);
  });

  // Attach delete listeners after rendering
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const index = this.dataset.index;
      const updatedJobs = loadTrackedJobs();
      updatedJobs.splice(index, 1); // Remove the job
      saveTrackedJobs(updatedJobs);
      renderTrackedJobs(); // Re-render table
    });
  });
}

renderTrackedJobs(); // Call once on page load

// Fetch job data
const spinner = document.getElementById('loading-spinner');

function fetchJobs() {
  spinner.classList.remove('hidden');
  jobContainer.innerHTML = '';

  fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
      const jobs = data.slice(1, 11); // Remove metadata

  jobs
  .filter(job => job.company && job.position && job.url) // ✅ Only include jobs with a company, title, and URL
  .forEach(job => {
    const jobCard = document.createElement('div');
    jobCard.className = 'job-card';
    jobCard.innerHTML = `
      <h3><a href="${job.url}" target="_blank">${job.position}</a></h3>
      <p><strong>Company:</strong> ${job.company}</p>
      <p><strong>Location:</strong> ${job.location || 'Remote'}</p>
      <p>${job.tags?.map(tag => `<span class="tag">${tag}</span>`).join(' ')}</p>
      <button class="track-btn">Track Job</button>
    `;
    jobContainer.appendChild(jobCard);

    jobCard.querySelector('.track-btn').addEventListener('click', () => {
      const trackedJobs = loadTrackedJobs();
      if (trackedJobs.some(j => j.url === job.url)) {
        alert("You've already tracked this job.");
        return;
      }

      trackedJobs.push({
        company: job.company,
        title: job.position,
        status: 'Saved',
        dateApplied: '',
        followUpDate: '',
        notes: '',
        url: job.url
      });

      saveTrackedJobs(trackedJobs);
      renderTrackedJobs();
    });
  });

    })
    .catch(err => {
      console.error("Job fetch failed:", err);
      jobContainer.innerHTML = `<p>Unable to load jobs.</p>`;
    })
    .finally(() => {
      spinner.classList.add('hidden');
    });
}

fetchJobs(); // Replace direct fetch call with this


// Search filter
document.getElementById('search').addEventListener('input', function (e) {
  const search = e.target.value.toLowerCase();
  document.querySelectorAll('.job-card').forEach(card => {
    card.style.display = card.textContent.toLowerCase().includes(search) ? 'block' : 'none';
  });
});
function downloadCSVFromTrackedJobs() {
  const trackedJobs = loadTrackedJobs();
  if (trackedJobs.length === 0) {
    alert("No jobs to download.");
    return;
  }

  const headers = ['Company', 'Job Title', 'Status', 'Date Applied', 'Follow-up Date', 'Notes', 'URL'];
  const rows = trackedJobs.map(job => [
    job.company,
    job.title,
    job.status,
    job.dateApplied || '',
    job.followUpDate || '',
    job.notes?.replace(/,/g, ';') || '',
    job.url
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'tracked-jobs.csv';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

document.getElementById('download-csv').addEventListener('click', downloadCSVFromTrackedJobs);
