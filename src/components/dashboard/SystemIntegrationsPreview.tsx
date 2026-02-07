"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Database, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/context/LocaleContext';
import { itemVariants } from './animations';

// Platform Logos
const PlatformLogos: { [key: string]: (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element } = {
    UIDAI: (props) => (
        <svg {...props} viewBox="0 0 100 100" className={props.className ?? "w-6 h-6"}>
            <circle cx="50" cy="50" r="45" fill="#FF9933" />
            <circle cx="50" cy="50" r="35" fill="#FFFFFF" />
            <circle cx="50" cy="50" r="25" fill="#138808" />
            <path d="M50 25 L50 75 M35 50 L65 50" stroke="#000080" strokeWidth="3" />
        </svg>
    ),
    MeitY: (props) => (
        <svg {...props} viewBox="0 0 100 100" className={props.className ?? "w-6 h-6"}>
            <rect x="20" y="20" width="60" height="60" rx="10" fill="#1E40AF" />
            <path d="M40 35 L60 50 L40 65 Z" fill="#FFFFFF" />
        </svg>
    ),
    MHA: (props) => (
        <svg {...props} viewBox="0 0 100 100" className={props.className ?? "w-6 h-6"}>
            <rect x="25" y="25" width="50" height="50" fill="#DC2626" />
            <path d="M45 40 L55 50 L45 60 Z M55 40 L45 50 L55 60 Z" fill="#FFFFFF" />
        </svg>
    ),
    NSDL: (props) => (
        <svg {...props} viewBox="0 0 100 100" className={props.className ?? "w-6 h-6"}>
            <rect x="20" y="20" width="60" height="60" rx="5" fill="#059669" />
            <text x="50" y="55" textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="bold">NSDL</text>
        </svg>
    ),
    NPCI: (props) => (
        <svg {...props} viewBox="0 0 100 100" className={props.className ?? "w-6 h-6"}>
            <circle cx="50" cy="50" r="40" fill="#2563EB" />
            <path d="M35 40 L65 40 L50 70 Z" fill="#FFFFFF" />
        </svg>
    ),
    CBDT: (props) => (
        <svg {...props} viewBox="0 0 100 100" className={props.className ?? "w-6 h-6"}>
            <rect x="25" y="25" width="50" height="50" fill="#D97706" />
            <path d="M40 40 L60 40 L60 60 L40 60 Z" fill="#FFFFFF" />
            <path d="M45 45 L55 45 L55 55 L45 55 Z" fill="#D97706" />
        </svg>
    ),
    'Ministry of Rural Development': (props) => (
        <svg {...props} viewBox="0 0 100 100" className={props.className ?? "w-6 h-6"}>
            <path d="M30 30 L70 30 L70 70 L30 70 Z" fill="#16A34A" />
            <circle cx="50" cy="50" r="15" fill="#FFFFFF" />
        </svg>
    ),
    'Various State Governments': (props) => (
        <svg {...props} viewBox="0 0 100 100" className={props.className ?? "w-6 h-6"}>
            <path d="M35 35 L65 35 L65 65 L35 65 Z" fill="#9333EA" />
            <circle cx="40" cy="40" r="5" fill="#FFFFFF" />
            <circle cx="60" cy="40" r="5" fill="#FFFFFF" />
            <circle cx="50" cy="60" r="5" fill="#FFFFFF" />
        </svg>
    )
};

const PlatformLogoWrapper = ({ provider, ...props }: { provider: string } & React.SVGProps<SVGSVGElement>) => {
    const Logo = PlatformLogos[provider as keyof typeof PlatformLogos];
    if (Logo) return <Logo {...props} />;
    return <Database {...props} />;
};

interface Integration {
    name: string;
    icon?: any; // The icon component
    provider?: string;
    imageUrl: string;
    status: string;
    color: string;
}

interface SystemIntegrationsPreviewProps {
    integrations: Integration[];
    loading: boolean;
}

export default function SystemIntegrationsPreview({ integrations, loading }: SystemIntegrationsPreviewProps) {
    const { t } = useLocale();
    const router = useRouter();

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return t('dashboard.status.active');
            case 'maintenance': return t('dashboard.status.maintenance');
            case 'down': return t('dashboard.status.down');
            default: return status;
        }
    };

    return (
        <motion.div
            variants={itemVariants}
            className="theme-bg-card theme-border-glass border-2 rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-sm group relative overflow-hidden"
        >
            {/* Animated Mesh Background */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="integration-mesh" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                            <circle cx="20" cy="20" r="1.5" fill="rgba(99, 102, 241, 0.8)" />
                            <line x1="20" y1="20" x2="40" y2="20" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="0.5" />
                            <line x1="20" y1="20" x2="20" y2="40" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#integration-mesh)" />
                </svg>
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <motion.div
                            className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg"
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                            <Database className="w-5 h-5 text-white" />
                            {/* Pulse rings */}
                            <motion.div
                                className="absolute inset-0 rounded-xl border-2 border-indigo-500"
                                animate={{ scale: [1, 1.4, 1.4], opacity: [0.5, 0, 0] }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }}
                            />
                            <motion.div
                                className="absolute inset-0 rounded-xl border-2 border-purple-500"
                                animate={{ scale: [1, 1.4, 1.4], opacity: [0.5, 0, 0] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 1, repeatDelay: 0.5 }}
                            />
                        </motion.div>
                        <div>
                            <h3 className="text-lg font-semibold theme-text-primary" style={{ overflow: 'visible', lineHeight: '1.4' }}>{t('dashboard.sections.systemIntegrations')}</h3>
                            <p className="text-xs theme-text-muted">Connected Services</p>
                        </div>
                    </div>
                    <motion.button
                        onClick={() => router.push('/dashboard/integrations')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-xs shadow-lg hover:shadow-xl transition-shadow"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span>{t('dashboard.common.viewFull')}</span>
                        <ArrowRight className="w-3 h-3" />
                    </motion.button>
                </div>

                {/* Grid Layout for Integrations */}
                <div className="grid grid-cols-2 gap-2.5">
                    {loading ? (
                        Array.from({ length: 6 }).map((_, idx) => (
                            <motion.div
                                key={idx}
                                className="p-3 rounded-lg theme-bg-glass border theme-border-glass animate-pulse h-16"
                            />
                        ))
                    ) : (
                        integrations.map((integration, idx) => {
                            const IconComp = integration.icon || PlatformLogoWrapper;
                            // If icon is passed as component from parent (which handles PlatformLogos logic if kept there), use it.
                            // But here we redefined PlatformLogos. So we need to handle if 'integration.icon' is already a component OR if we need to use 'integration.name' to pick.
                            // In DashboardComponent, 'icon' was set to the component from getPlatformLogo.
                            // So if we pass 'icon' prop, we can use it.

                            // Note: We need to handle the case where integration object structure passes 'provider' or 'name' to choose logo
                            const LogoToRender = integration.icon ? integration.icon : (
                                (props: any) => <PlatformLogoWrapper provider={integration.provider || integration.name} {...props} />
                            );

                            return (
                                <motion.div
                                    key={integration.name}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group/item relative p-3 rounded-xl theme-bg-glass theme-border-glass border hover:bg-white/5 transition-colors overflow-hidden cursor-pointer"
                                    onClick={() => router.push('/dashboard/integrations')}
                                >
                                    <div className="flex items-start justify-between mb-2 relative z-10">
                                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${integration.color} flex items-center justify-center shadow-md p-1.5`}>
                                            {/* If integration.icon is a component, render it. Else render wrapper */}
                                            <LogoToRender className="w-full h-full text-white" />
                                        </div>
                                        <div className={`w-2 h-2 rounded-full ${integration.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} />
                                    </div>

                                    <div className="relative z-10">
                                        <p className="font-semibold text-xs theme-text-primary truncate">{integration.name}</p>
                                        <p className="text-[10px] theme-text-muted capitalize">{getStatusText(integration.status)}</p>
                                    </div>

                                    {/* Hover Glow */}
                                    <motion.div
                                        className={`absolute -right-4 -bottom-4 w-16 h-16 bg-gradient-to-br ${integration.color} opacity-0 group-hover/item:opacity-20 rounded-full blur-xl transition-opacity duration-300`}
                                    />
                                </motion.div>
                            )
                        })
                    )}
                </div>
            </div>
        </motion.div>
    );
}
