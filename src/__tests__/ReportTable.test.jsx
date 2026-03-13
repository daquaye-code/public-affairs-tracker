import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReportTable from '../components/ReportTable';
import ReportStatusPill from '../components/ReportStatusPill';

const mockOfficers = [
  { id: 'o1', full_name: 'Isaac', area_office: 'Area Office 1' },
  { id: 'o2', full_name: 'Sarah', area_office: 'Area Office 2' },
  { id: 'o3', full_name: 'Daniel', area_office: 'Area Office 3' },
];

const mockReportTypes = [
  { id: 'rt1', name: 'Monthly Report' },
  { id: 'rt2', name: 'Finance Report' },
  { id: 'rt3', name: 'Activity Report' },
];

describe('ReportTable', () => {
  it('renders dynamic columns from report types', () => {
    render(
      <ReportTable
        officers={mockOfficers}
        reportTypes={mockReportTypes}
        submissions={[]}
        searchQuery=""
      />
    );

    expect(screen.getByText('Monthly Report')).toBeInTheDocument();
    expect(screen.getByText('Finance Report')).toBeInTheDocument();
    expect(screen.getByText('Activity Report')).toBeInTheDocument();
  });

  it('renders all officers', () => {
    render(
      <ReportTable
        officers={mockOfficers}
        reportTypes={mockReportTypes}
        submissions={[]}
        searchQuery=""
      />
    );

    expect(screen.getByText('Isaac')).toBeInTheDocument();
    expect(screen.getByText('Sarah')).toBeInTheDocument();
    expect(screen.getByText('Daniel')).toBeInTheDocument();
  });

  it('shows Pending by default when no submission exists', () => {
    render(
      <ReportTable
        officers={mockOfficers}
        reportTypes={mockReportTypes}
        submissions={[]}
        searchQuery=""
      />
    );

    const pendingPills = screen.getAllByText('Pending');
    expect(pendingPills).toHaveLength(9);
  });

  it('shows Submitted when a submission record exists with submitted=true', () => {
    const submissions = [
      {
        id: 's1',
        officer_id: 'o1',
        report_type_id: 'rt1',
        report_month: '2026-03',
        submitted: true,
      },
    ];

    render(
      <ReportTable
        officers={mockOfficers}
        reportTypes={mockReportTypes}
        submissions={submissions}
        searchQuery=""
      />
    );

    const submittedPills = screen.getAllByText('Submitted');
    expect(submittedPills).toHaveLength(1);
    const pendingPills = screen.getAllByText('Pending');
    expect(pendingPills).toHaveLength(8);
  });

  it('shows correct progress count', () => {
    const submissions = [
      {
        id: 's1',
        officer_id: 'o1',
        report_type_id: 'rt1',
        report_month: '2026-03',
        submitted: true,
      },
      {
        id: 's2',
        officer_id: 'o1',
        report_type_id: 'rt2',
        report_month: '2026-03',
        submitted: true,
      },
    ];

    render(
      <ReportTable
        officers={mockOfficers}
        reportTypes={mockReportTypes}
        submissions={submissions}
        searchQuery=""
      />
    );

    expect(screen.getByText('2/3')).toBeInTheDocument();
    const zeros = screen.getAllByText('0/3');
    expect(zeros).toHaveLength(2);
  });

  it('filters officers by search query', () => {
    render(
      <ReportTable
        officers={mockOfficers}
        reportTypes={mockReportTypes}
        submissions={[]}
        searchQuery="sarah"
      />
    );

    expect(screen.getByText('Sarah')).toBeInTheDocument();
    expect(screen.queryByText('Isaac')).not.toBeInTheDocument();
    expect(screen.queryByText('Daniel')).not.toBeInTheDocument();
  });

  it('shows empty message when no officers match search', () => {
    render(
      <ReportTable
        officers={mockOfficers}
        reportTypes={mockReportTypes}
        submissions={[]}
        searchQuery="zzzzz"
      />
    );

    expect(screen.getByText('No officers match your search.')).toBeInTheDocument();
  });
});

describe('ReportStatusPill', () => {
  it('renders Submitted pill when submitted is true', () => {
    render(<ReportStatusPill submitted={true} />);
    expect(screen.getByText('Submitted')).toBeInTheDocument();
  });

  it('renders Pending pill when submitted is false', () => {
    render(<ReportStatusPill submitted={false} />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });
});
