const apiUrl = 'https://remoteok.com/api';

fetch(apiUrl)
  .then(res => res.json())
  .then(data => {
    const jobs = data.slice(1, 11); // First item is metadata
    jobs.forEach(job => {
      const jobCard = document.createElement('div');
      jobCard.className = 'job-card';
      jobCard.innerHTML = `
        <h3><a href="${job.url}" target="_blank">${job.position}</a></h3>
        <p><strong>Company:</strong> ${job.company}</p>
        <p><strong>Location:</strong> ${job.location}</p>
        <p>${job.tags.join(', ')}</p>
      `;
      document.getElementById('job-listings').appendChild(jobCard);
    });
  })
  .catch(err => {
    console.error("Job fetch failed:", err);
    document.getElementById('job-listings').innerHTML = `<p>Unable to load jobs.</p>`;
  });
