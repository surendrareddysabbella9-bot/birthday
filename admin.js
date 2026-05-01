// Using Vercel Serverless Functions for backend operations

async function fetchSubmissions() {
    const tbody = document.getElementById('table-body');
    
    try {
        const response = await fetch(`/api/getFeedbacks`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const result = await response.json();
        const documents = result.documents;
        
        tbody.innerHTML = '';
        
        if (!documents || documents.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#ccc;">No feedback missions found.</td></tr>';
            return;
        }

        documents.forEach((data) => {
            const tr = document.createElement('tr');
            
            let dateStr = "Unknown";
            if (data.timestamp) {
                const date = new Date(data.timestamp);
                dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            }
            
            tr.innerHTML = `
                <td style="font-weight:600; color:var(--text-main);">${escapeHTML(data.name || '')}</td>
                <td>${escapeHTML(data.liked_about_me || '')}</td>
                <td>${escapeHTML(data.dislike_about_me || '')}</td>
                <td>${escapeHTML(data.birthday_message || '')}</td>
                <td>${escapeHTML(data.fun_answer_1 || '')}</td>
                <td>${escapeHTML(data.fun_answer_2 || '')}</td>
                <td style="font-size:0.85rem; color:var(--text-muted);">${dateStr}</td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Error fetching documents: ", error);
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--neon-red);">Error loading data. Check console and Firebase permissions.</td></tr>`;
    }
}

// Utility to prevent XSS
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag])
    );
}

// Initialize on load
document.addEventListener('DOMContentLoaded', fetchSubmissions);
