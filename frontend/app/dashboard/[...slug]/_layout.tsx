// import { Metadata } from 'next';

// type Props = {
//   params: { slug: string[] };
// };

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   // slug can be ['server', '123456789', 'overview'] or ['user', 'main']
//   const slug = params.slug || [];
//   const type = slug[0]; // 'server' or 'user'
//   const page = slug[2] || slug[1] || 'Overview';
  
//   // Format the page name (e.g., 'overview' -> 'Overview')
//   const formattedPage = page.charAt(0).toUpperCase() + page.slice(1);
  
//   let title = `${formattedPage} | Dashboard`;
//   let description = `Manage your Yumi Bot settings.`;

//   if (type === 'server') {
//     title = `${formattedPage} | Server Dashboard`;
//     description = `Manage settings and configurations for this server on Yumi Bot.`;
//   } else if (type === 'user') {
//     title = `${formattedPage} | User Dashboard`;
//     description = `Manage your personal Yumi Bot settings.`;
//   }
  
//   return {
//     title,
//     description,
//     openGraph: {
//       title: `${title} | Yumi Bot`,
//       description,
//     },
//     twitter: {
//       title: `${title} | Yumi Bot`,
//       description,
//     }
//   };
// }

// export default function DynamicDashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return <>{children}</>;
// }
