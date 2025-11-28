import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Issue, ReportFilters } from '@/types';
import { format } from 'date-fns';

/**
 * Generate PDF report for a single issue
 */
export const generateSingleIssueReport = (issue: Issue): void => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Issue Report', 105, 20, { align: 'center' });
  
  // Issue ID
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Issue ID: ${issue.id}`, 20, 35);
  doc.text(`Generated: ${format(new Date(), 'PPpp')}`, 20, 42);
  
  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 48, 190, 48);
  
  let yPos = 58;
  
  // Issue Details
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Issue Details', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const details = [
    ['Title', issue.title],
    ['Description', issue.description],
    ['Category', issue.category],
    ['Priority', issue.priority],
    ['Status', issue.status],
    ['Reporter', issue.reporterName],
    ['Assigned To', issue.assignedToName || 'Unassigned'],
    ['Location Type', issue.location.type],
    ['Location Name', issue.location.name],
    ['Building', issue.location.building || 'N/A'],
    ['Floor', issue.location.floor?.toString() || 'N/A'],
    ['Created At', format(new Date(issue.createdAt), 'PPpp')],
    ['Updated At', format(new Date(issue.updatedAt), 'PPpp')],
  ];
  
  if (issue.resolvedAt) {
    details.push(['Resolved At', format(new Date(issue.resolvedAt), 'PPpp')]);
  }
  
  autoTable(doc, {
    startY: yPos,
    head: [],
    body: details,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 120 }
    }
  });
  
  // @ts-ignore - autoTable adds finalY to doc
  yPos = doc.lastAutoTable.finalY + 15;
  
  // Comments Section
  if (issue.comments && issue.comments.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Comments', 20, yPos);
    yPos += 10;
    
    const commentData = issue.comments.map(comment => [
      comment.userName,
      format(new Date(comment.createdAt), 'PP'),
      comment.content
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['User', 'Date', 'Comment']],
      body: commentData,
      theme: 'striped',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [66, 139, 202] },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 35 },
        2: { cellWidth: 95 }
      }
    });
  }
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Page ${i} of ${pageCount}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  // Save
  doc.save(`issue-${issue.id}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

/**
 * Generate PDF report for multiple issues
 */
export const generateAllIssuesReport = (
  issues: Issue[],
  filters?: ReportFilters
): void => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Issues Report', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${format(new Date(), 'PPpp')}`, 105, 30, { align: 'center' });
  doc.text(`Total Issues: ${issues.length}`, 105, 37, { align: 'center' });
  
  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 43, 190, 43);
  
  let yPos = 53;
  
  // Summary Statistics
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 20, yPos);
  yPos += 10;
  
  const statusCounts = issues.reduce((acc, issue) => {
    acc[issue.status] = (acc[issue.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const priorityCounts = issues.reduce((acc, issue) => {
    acc[issue.priority] = (acc[issue.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const categoryCounts = issues.reduce((acc, issue) => {
    acc[issue.category] = (acc[issue.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const summaryData = [
    ['By Status', ''],
    ...Object.entries(statusCounts).map(([status, count]) => [
      `  ${status}`,
      count.toString()
    ]),
    ['', ''],
    ['By Priority', ''],
    ...Object.entries(priorityCounts).map(([priority, count]) => [
      `  ${priority}`,
      count.toString()
    ]),
    ['', ''],
    ['By Category', ''],
    ...Object.entries(categoryCounts).map(([category, count]) => [
      `  ${category}`,
      count.toString()
    ])
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [],
    body: summaryData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 140 },
      1: { cellWidth: 30, halign: 'right' }
    }
  });
  
  // @ts-ignore
  yPos = doc.lastAutoTable.finalY + 15;
  
  // Issues Table
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Issues List', 20, yPos);
  yPos += 10;
  
  const issueData = issues.map(issue => [
    issue.id,
    issue.title.substring(0, 40) + (issue.title.length > 40 ? '...' : ''),
    issue.category,
    issue.priority,
    issue.status,
    issue.reporterName,
    format(new Date(issue.createdAt), 'PP')
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['ID', 'Title', 'Category', 'Priority', 'Status', 'Reporter', 'Date']],
    body: issueData,
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [66, 139, 202], fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 50 },
      2: { cellWidth: 25 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20 },
      5: { cellWidth: 30 },
      6: { cellWidth: 20 }
    }
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Page ${i} of ${pageCount}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  // Save
  doc.save(`issues-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

/**
 * Generate analytics dashboard PDF report
 */
export const generateAnalyticsDashboardReport = async (
  chartElements: HTMLElement[]
): Promise<void> => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Analytics Dashboard Report', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${format(new Date(), 'PPpp')}`, 105, 30, { align: 'center' });
  
  // Note: Chart rendering would require html2canvas
  // For now, we'll add a placeholder
  doc.setFontSize(10);
  doc.text('Charts and visualizations would be rendered here', 20, 50);
  
  // Save
  doc.save(`analytics-dashboard-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};
