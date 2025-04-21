import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { getProfile } from '../redux/authSlice';
import Button from '../components/Button';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardContainer = styled.div`
  padding: 24px;
  background-color: #f8f9fa;
  min-height: 100vh;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.8rem;
  color: #202124;
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 12px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled(Card)`
  min-height: 100px;
`;

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a73e8;
  margin-bottom: 4px;
`;

const ChartContainer = styled.div`
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 4px;
`;

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    gamesWon: 0,
    winRate: '0%',
    totalMandates: 0
  });

  useEffect(() => {
    if (!user) {
      dispatch(getProfile());
    } else {
      // Simulated stats - in a real app, these would come from the backend
      setStats({
        gamesPlayed: 24,
        gamesWon: 14,
        winRate: '58%',
        totalMandates: 112
      });
    }
  }, [dispatch, user]);

  const handleCreateGame = () => {
    navigate('/create-game');
  };

  const handleJoinGame = (gameId) => {
    navigate(`/game/${ gameId }`);
  };

  const handleEditDecks = () => {
    navigate('/decks');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const statsData = [
    { title: 'Total Users', value: '1,254', change: '+12%' },
    { title: 'Active Projects', value: '42', change: '+3%' },
    { title: 'Conversion Rate', value: '6.8%', change: '-0.5%' },
    { title: 'Revenue', value: '$12,580', change: '+18%' }
  ];

  const recentProjects = [
    { id: 1, title: 'Website Redesign', status: 'In Progress', progress: 68 },
    { id: 2, title: 'Mobile Application', status: 'Planning', progress: 23 },
    { id: 3, title: 'Marketing Campaign', status: 'Completed', progress: 100 },
    { id: 4, title: 'Database Migration', status: 'On Hold', progress: 34 }
  ];

  return (
    <DashboardContainer>
      <PageHeader>
        <Title>Dashboard</Title>
        <ActionsContainer>
          <Button variant="outline" icon="filter">Filter</Button>
          <Button variant="primary" icon="plus">New Project</Button>
        </ActionsContainer>
      </PageHeader>

      <div style={{ marginBottom: 24 }}>
        <Button
          variant={activeTab === 'overview' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </Button>
        <Button
          variant={activeTab === 'projects' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('projects')}
          style={{ marginLeft: 8 }}
        >
          Projects
        </Button>
        <Button
          variant={activeTab === 'analytics' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('analytics')}
          style={{ marginLeft: 8 }}
        >
          Analytics
        </Button>
      </div>

      {activeTab === 'overview' && (
        <>
          <StatsGrid>
            {statsData.map((stat, index) => (
              <StatCard key={index} hoverable>
                <Card.Content>
                  <div style={{ opacity: 0.6, marginBottom: 8 }}>{stat.title}</div>
                  <StatValue>{stat.value}</StatValue>
                  <div style={{
                    color: stat.change.startsWith('+') ? '#34a853' : '#ea4335',
                    fontSize: '0.875rem'
                  }}>
                    {stat.change} from last month
                  </div>
                </Card.Content>
              </StatCard>
            ))}
          </StatsGrid>

          <Grid>
            <Card fullWidth>
              <Card.Header title="Revenue Overview" divider />
              <Card.Content>
                <ChartContainer>
                  [Revenue Chart Placeholder]
                </ChartContainer>
              </Card.Content>
            </Card>

            <Card>
              <Card.Header title="Recent Projects" divider />
              <Card.Content padding="0">
                {recentProjects.map((project) => (
                  <div key={project.id} style={{
                    padding: '12px 20px',
                    borderBottom: '1px solid #e0e0e0'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 4
                    }}>
                      <div style={{ fontWeight: 500 }}>{project.title}</div>
                      <div style={{
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        backgroundColor:
                          project.status === 'Completed' ? '#e6f4ea' :
                            project.status === 'In Progress' ? '#e8f0fe' :
                              project.status === 'On Hold' ? '#fef7e0' : '#f3e8fd',
                        color:
                          project.status === 'Completed' ? '#137333' :
                            project.status === 'In Progress' ? '#1967d2' :
                              project.status === 'On Hold' ? '#ea8600' : '#9334e6'
                      }}>
                        {project.status}
                      </div>
                    </div>
                    <div style={{
                      height: 4,
                      backgroundColor: '#e0e0e0',
                      borderRadius: 2,
                      marginTop: 8
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${ project.progress }%`,
                        backgroundColor:
                          project.progress === 100 ? '#34a853' :
                            project.progress > 50 ? '#4285f4' :
                              project.progress > 25 ? '#fbbc04' : '#ea4335',
                        borderRadius: 2
                      }} />
                    </div>
                  </div>
                ))}
              </Card.Content>
              <Card.Actions divider position="right">
                <Button variant="outline" small>View All</Button>
              </Card.Actions>
            </Card>

            <Card>
              <Card.Header title="Team Members" subtitle="Active collaborators" divider />
              <Card.Content>
                <p>Team members content goes here</p>
              </Card.Content>
              <Card.Actions divider position="space-between">
                <Button variant="outline" small>Invite</Button>
                <Button variant="outline" small>Manage Team</Button>
              </Card.Actions>
            </Card>
          </Grid>
        </>
      )}

      {activeTab === 'projects' && (
        <Card>
          <Card.Header title="Projects" divider />
          <Card.Content>
            <p>Projects tab content goes here.</p>
          </Card.Content>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <Card>
          <Card.Header title="Analytics" divider />
          <Card.Content>
            <p>Analytics tab content goes here.</p>
          </Card.Content>
        </Card>
      )}
    </DashboardContainer>
  );
};

export default Dashboard;