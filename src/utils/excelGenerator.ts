import * as XLSX from 'xlsx';
import { Issue, ReportFilters } from '@/types';
import { format } from 'date-fns';

/**
 * Generate Excel report for a single issue
 */
export const generateSingleIssueReport = (issue: Issue): void => {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Issue Details Sheet
    const detailsData = [
        ['Issue Report'],
        [''],
        ['Issue ID', issue.id],
        ['Generated', format(new Date(), 'PPpp')],
        [''],
        ['Issue Details'],
        ['Title', issue.title],
        ['Description', issue.description],
        ['Category', issue.category],
        ['Priority', issue.priority],
        ['Status', issue.status],
        ['Reporter', issue.reporterName],
        ['Assigned To', issue.assignedToName || 'Unassigned'],
        [''],
        ['Location Details'],
        ['Location Type', issue.location.type],
        ['Location Name', issue.location.name],
        ['Building', issue.location.building || 'N/A'],
        ['Floor', issue.location.floor?.toString() || 'N/A'],
        [''],
        ['Timeline'],
        ['Created At', format(new Date(issue.createdAt), 'PPpp')],
        ['Updated At', format(new Date(issue.updatedAt), 'PPpp')],
    ];

    if (issue.resolvedAt) {
        detailsData.push(['Resolved At', format(new Date(issue.resolvedAt), 'PPpp')]);
    }

    const detailsSheet = XLSX.utils.aoa_to_sheet(detailsData);

    // Set column widths
    detailsSheet['!cols'] = [
        { wch: 20 },
        { wch: 50 }
    ];

    XLSX.utils.book_append_sheet(workbook, detailsSheet, 'Issue Details');

    // Comments Sheet (if comments exist)
    if (issue.comments && issue.comments.length > 0) {
        const commentsData = [
            ['Comments'],
            [''],
            ['User', 'Date', 'Comment'],
            ...issue.comments.map(comment => [
                comment.userName,
                format(new Date(comment.createdAt), 'PP'),
                comment.content
            ])
        ];

        const commentsSheet = XLSX.utils.aoa_to_sheet(commentsData);
        commentsSheet['!cols'] = [
            { wch: 20 },
            { wch: 15 },
            { wch: 50 }
        ];

        XLSX.utils.book_append_sheet(workbook, commentsSheet, 'Comments');
    }

    // Generate and download the file
    XLSX.writeFile(workbook, `issue-${issue.id}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};

/**
 * Generate Excel report for multiple issues
 */
export const generateAllIssuesReport = (
    issues: Issue[],
    filters?: ReportFilters
): void => {
    console.log('Generating report for issues:', issues.length, issues);

    if (!issues || issues.length === 0) {
        alert('No issues to export');
        return;
    }

    const workbook = XLSX.utils.book_new();

    // Summary Sheet
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

    const summaryData = [
        ['Issues Report'],
        [''],
        ['Generated', format(new Date(), 'PPpp')],
        ['Total Issues', issues.length],
        [''],
        ['Summary by Status'],
        ...Object.entries(statusCounts).map(([status, count]) => [status, count]),
        [''],
        ['Summary by Priority'],
        ...Object.entries(priorityCounts).map(([priority, count]) => [priority, count]),
        [''],
        ['Summary by Category'],
        ...Object.entries(categoryCounts).map(([category, count]) => [category, count]),
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [
        { wch: 25 },
        { wch: 15 }
    ];

    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Issues List Sheet
    console.log('Processing issues for Excel:');
    const issuesData = [
        ['Issues List'],
        [''],
        ['ID', 'Title', 'Description', 'Category', 'Priority', 'Status', 'Reporter', 'Assigned To', 'Location', 'Created Date', 'Updated Date'],
        ...issues.map((issue, index) => {
            const issueData: any = issue; // Cast to any to handle MongoDB _id field
            const row = [
                issueData._id || issue.id || 'N/A',
                issue.title || 'N/A',
                issue.description || 'N/A',
                issue.category || 'N/A',
                issue.priority || 'N/A',
                issue.status || 'N/A',
                issue.reporterName || 'N/A',
                issue.assignedToName || 'Unassigned',
                `${issue.location?.name || 'N/A'} - ${issue.location?.building || 'N/A'}`,
                issue.createdAt ? format(new Date(issue.createdAt), 'PP') : 'N/A',
                issue.updatedAt ? format(new Date(issue.updatedAt), 'PP') : 'N/A'
            ];
            console.log(`Issue ${index + 1}:`, row);
            return row;
        })
    ];

    console.log('Total rows in Excel (including headers):', issuesData.length);
    const issuesSheet = XLSX.utils.aoa_to_sheet(issuesData);
    issuesSheet['!cols'] = [
        { wch: 25 },  // ID
        { wch: 30 },  // Title
        { wch: 50 },  // Description
        { wch: 15 },  // Category
        { wch: 12 },  // Priority
        { wch: 12 },  // Status
        { wch: 20 },  // Reporter
        { wch: 20 },  // Assigned To
        { wch: 30 },  // Location
        { wch: 15 },  // Created Date
        { wch: 15 }   // Updated Date
    ];

    XLSX.utils.book_append_sheet(workbook, issuesSheet, 'Issues List');

    // Generate and download the file
    const filename = `issues-report-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.xlsx`;
    console.log('Writing Excel file:', filename);
    XLSX.writeFile(workbook, filename);
    console.log('Report generated successfully');
};
