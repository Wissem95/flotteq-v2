import { useState, useEffect } from 'react';
import { reportsService } from '../api/services/reports.service';
import { Report } from '../types/report.types';

export const useDriverReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsService.getDriverReports();
      setReports(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des signalements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return {
    reports,
    loading,
    error,
    refetch: fetchReports,
  };
};

export const useReportById = (id: string | undefined) => {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await reportsService.getReportById(id);
        setReport(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erreur lors du chargement du signalement');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  return {
    report,
    loading,
    error,
  };
};
