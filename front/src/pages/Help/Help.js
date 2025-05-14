import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './Help.css';
import { useTranslation } from 'react-i18next';

// Анимации для заголовка
const titleVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.6, -0.05, 0.01, 0.99],
      when: "beforeChildren"
    }
  }
};

// Анимации для секций помощи
const sectionVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.6, -0.05, 0.01, 0.99]
    }
  },
  hover: {
    y: -10,
    scale: 1.02,
    boxShadow: "0 20px 25px -5px rgba(154, 72, 234, 0.3), 0 10px 10px -5px rgba(154, 72, 234, 0.1)",
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  tap: {
    scale: 0.98
  }
};

// Анимации для вопросов
const questionVariants = {
  hidden: { x: -30, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "backOut"
    }
  },
  hover: {
    color: "#ffffff",
    textShadow: "0 0 8px rgba(154, 72, 234, 0.7)",
    transition: {
      duration: 0.2
    }
  }
};

// Анимации для ответов
const answerVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: "auto",
    opacity: 1,
    transition: {
      delay: 0.3,
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

// Компонент с наблюдателем за видимостью
const AnimatedSection = ({ children, delay = 0 }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  React.useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={sectionVariants}
      whileHover="hover"
      whileTap="tap"
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
};

const Help = () => {


  // ================ Перевод ================
  const { t, i18n } = useTranslation();
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);
  // ================ Перевод ================
  const user = useSelector((state) => state.auth.user);
  
  return (
    <div className="dashboard-container">
      <div className="main-content">
        <div className="breadcrumb">{t('help_breadcrumb')}</div>
        
        {/* Анимированный заголовок */}
        <motion.h1 
          className="dashboard-title"
          initial="hidden"
          animate="visible"
          variants={titleVariants}
        >
          <motion.span
            style={{ display: 'inline-block' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('help_title')}
          </motion.span>
        </motion.h1>
        
        {/* Секции помощи */}
        <div className="help-sections">
          <AnimatedSection delay={0.1}>
            <h2 className="help-section-title">
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {t('help_section_projects')}
              </motion.span>
            </h2>
            <motion.div className="help-item" variants={questionVariants}>
              <motion.h3 className="help-question" whileHover="hover">
                {t('help_question_create_project')}
              </motion.h3>
              <motion.p className="help-answer" variants={answerVariants}>
                {t('help_answer_create_project').split('\n').map((line, i) => (
                  <React.Fragment key={i}>{line}<br /></React.Fragment>
                ))}
              </motion.p>
            </motion.div>
            <motion.div className="help-item" variants={questionVariants}>
              <motion.h3 className="help-question" whileHover="hover">
                {t('help_question_create_task')}
              </motion.h3>
              <motion.p className="help-answer" variants={answerVariants}>
              {t('help_answer_create_task').split('\n').map((line, i) => (
                <React.Fragment key={i}>{line}<br /></React.Fragment>
              ))}
              </motion.p>
            </motion.div>
          </AnimatedSection>
          
          <AnimatedSection delay={0.2}>
            <h2 className="help-section-title">
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {t('help_section_account')}
              </motion.span>
            </h2>
            <motion.div className="help-item" variants={questionVariants}>
              <motion.h3 className="help-question" whileHover="hover">
                {t('help_question_change_password')}
              </motion.h3>
              <motion.p className="help-answer" variants={answerVariants}>
                {t('help_answer_change_password')}
              </motion.p>
            </motion.div>
            <motion.div className="help-item" variants={questionVariants}>
              <motion.h3 className="help-question" whileHover="hover">
                {t('help_question_update_profile')}
              </motion.h3>
              <motion.p className="help-answer" variants={answerVariants}>
                {t('help_answer_update_profile')}
              </motion.p>
            </motion.div>
          </AnimatedSection>
          
          <AnimatedSection delay={0.3}>
            <h2 className="help-section-title">
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {t('help_section_visualization')}
              </motion.span>
            </h2>
            <motion.div className="help-item" variants={questionVariants}>
              <motion.h3 className="help-question" whileHover="hover">
              {t('help_question_gantt')}
              </motion.h3>
              <motion.p className="help-answer" variants={answerVariants}>
                {t('help_answer_gantt').split('\n').map((line, i) => (
                  <React.Fragment key={i}>{line}<br /></React.Fragment>
                ))}
              </motion.p>
            </motion.div>
            <motion.div className="help-item" variants={questionVariants}>
              <motion.h3 className="help-question" whileHover="hover">
              {t('help_question_pie_chart')}
              </motion.h3>
              <motion.p className="help-answer" variants={answerVariants}>
                {t('help_answer_pie_chart').split('\n').map((line, i) => (
                  <React.Fragment key={i}>{line}<br /></React.Fragment>
                ))}
              </motion.p>
            </motion.div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
};

export default Help;