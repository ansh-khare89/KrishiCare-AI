export function printDiagnosisReport(result, remedies = null) {
  const dateStr = new Date(result.timestamp || Date.now()).toLocaleString()
  
  const organicHtml = remedies?.organic?.length
    ? `
      <div class="section">
        <h3 style="color: #15803d; border-bottom: 1px solid #dcfce7; padding-bottom: 4px; margin-bottom: 8px;">🌿 Organic & Biological Remedies</h3>
        ${remedies.organic
          .map(
            (o) => `
          <div style="margin-bottom: 8px;">
            <strong>${o.title}</strong><br/>
            <span style="font-size: 13px; color: #374151;">Application: ${o.application}</span><br/>
            ${o.notes ? `<span style="font-size: 12px; color: #6b7280;"><em>Note: ${o.notes}</em></span>` : ''}
          </div>
        `
          )
          .join('')}
      </div>
    `
    : ''

  const chemicalHtml = remedies?.chemical?.length
    ? `
      <div class="section">
        <h3 style="color: #b45309; border-bottom: 1px solid #fef3c7; padding-bottom: 4px; margin-bottom: 8px;">🧪 Recommended Chemical Treatments</h3>
        ${remedies.chemical
          .map(
            (c) => `
          <div style="margin-bottom: 8px;">
            <strong>${c.name}</strong> — <span style="color: #b45309; font-weight: 600;">Dosage: ${c.dosage}</span><br/>
            ${c.safety ? `<span style="font-size: 12px; color: #4b5563;">Safety & Usage: ${c.safety}</span>` : ''}
          </div>
        `
          )
          .join('')}
      </div>
    `
    : ''

  const immediateHtml = remedies?.immediateActions?.length
    ? `
      <div class="section" style="background: #fff7ed; padding: 12px; border-radius: 8px; border-left: 4px solid #f97316;">
        <strong style="color: #9a3412;">⚡ Immediate First Steps:</strong>
        <ul style="margin: 6px 0 0 16px; padding: 0; font-size: 13px; color: #7c2d12;">
          ${remedies.immediateActions.map((a) => `<li>${a}</li>`).join('')}
        </ul>
      </div>
    `
    : ''

  const preventionHtml = remedies?.prevention?.length
    ? `
      <div class="section">
        <h3 style="color: #0369a1; border-bottom: 1px solid #e0f2fe; padding-bottom: 4px; margin-bottom: 8px;">🛡️ Prevention & Cultural Practices</h3>
        <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #374151;">
          ${remedies.prevention.map((p) => `<li><strong>${p.title}:</strong> ${p.description}</li>`).join('')}
        </ul>
      </div>
    `
    : ''

  const html = `<!DOCTYPE html>
<html><head><title>KrishiCare AI Diagnosis & Remedy Report - ${result.diseaseName}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; padding: 36px; color: #1f2937; line-height: 1.5; }
  .header { border-bottom: 2px solid #16a34a; padding-bottom: 12px; margin-bottom: 20px; }
  h1 { color: #16a34a; margin: 0 0 4px 0; font-size: 24px; }
  .meta { color: #6b7280; font-size: 13px; }
  .badge-grid { display: flex; gap: 12px; margin-bottom: 20px; font-size: 14px; }
  .badge { background: #f3f4f6; padding: 4px 10px; border-radius: 6px; border: 1px solid #e5e7eb; }
  .badge-green { background: #ecfdf5; color: #047857; border-color: #a7f3d0; font-weight: bold; }
  .section { margin-bottom: 18px; }
  .label { font-weight: bold; color: #374151; }
  .footer { margin-top: 36px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; }
</style></head><body>
  <div class="header">
    <h1>KrishiCare AI — Crop Health & Remedy Report</h1>
    <div class="meta">Generated on ${dateStr}</div>
  </div>

  <div class="badge-grid">
    <div class="badge"><strong>Crop:</strong> ${result.cropName}</div>
    <div class="badge badge-green"><strong>Diagnosis:</strong> ${result.diseaseName}</div>
    <div class="badge"><strong>Confidence:</strong> ${result.confidence?.toFixed(1)}%</div>
    ${result.severity ? `<div class="badge"><strong>Severity:</strong> ${result.severity}</div>` : ''}
    ${result.modelVersion ? `<div class="badge"><strong>Model:</strong> ${result.modelVersion}</div>` : ''}
  </div>

  <div class="section">
    <span class="label">Agronomic Advisory:</span>
    <p style="margin-top: 4px; font-size: 14px; color: #374151; background: #f9fafb; padding: 10px; border-radius: 6px; border: 1px solid #f3f4f6;">${result.advisory}</p>
  </div>

  ${immediateHtml}
  ${organicHtml}
  ${chemicalHtml}
  ${preventionHtml}

  ${
    result.topPredictions?.length
      ? `<div class="section" style="margin-top: 24px;">
          <span class="label">Model Top Predictions:</span>
          <ul style="margin: 6px 0 0 18px; font-size: 13px; color: #4b5563;">
            ${result.topPredictions
              .map((p) => `<li>${p.diseaseName} — <strong>${p.confidence?.toFixed(1)}%</strong></li>`)
              .join('')}
          </ul>
        </div>`
      : ''
  }

  <div class="footer">
    KrishiCare AI Crop Diagnostic Intelligence. Please consult your local agronomy extension officer for specific localized chemical restrictions and soil test verification.
  </div>
</body></html>`

  const win = window.open('', '_blank')
  if (win) {
    win.document.write(html)
    win.document.close()
    win.focus()
    win.print()
  }
}
