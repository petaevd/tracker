import React from 'react';
import { useSelector } from 'react-redux';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './Help.css';

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
  const user = useSelector((state) => state.auth.user);
  
  return (
    <div className="dashboard-container">
      <div className="main-content">
        <div className="breadcrumb">Домашняя / Помощь</div>
        
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
            Помощь
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
                Управление проектами
              </motion.span>
            </h2>
            <motion.div className="help-item" variants={questionVariants}>
              <motion.h3 className="help-question" whileHover="hover">
                Как создать проект?
              </motion.h3>
              <motion.p className="help-answer" variants={answerVariants}>
                1. Перейдите во вкладку "Проекты"<br />
                2. Выберите "Команды"<br />
                3. Нажмите "Создать команду" и добавьте участников<br />
                4. Вернитесь в "Проекты" и создайте новый проект<br />
                5. Добавьте команду, которая будет работать над проектом
              </motion.p>
            </motion.div>
            <motion.div className="help-item" variants={questionVariants}>
              <motion.h3 className="help-question" whileHover="hover">
                Как создать задачу?
              </motion.h3>
              <motion.p className="help-answer" variants={answerVariants}>
                1. На главном экране нажмите "Добавить задачу"<br />
                2. Введите параметры задачи (название, описание, сроки)<br />
                3. Выберите проект, в который должна попасть задача<br />
                4. Нажмите "Создать"
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
                Настройки аккаунта
              </motion.span>
            </h2>
            <motion.div className="help-item" variants={questionVariants}>
              <motion.h3 className="help-question" whileHover="hover">
                Как изменить пароль?
              </motion.h3>
              <motion.p className="help-answer" variants={answerVariants}>
                В разделе "Настройки" → "Безопасность" вы можете изменить ваш пароль.
              </motion.p>
            </motion.div>
            <motion.div className="help-item" variants={questionVariants}>
              <motion.h3 className="help-question" whileHover="hover">
                Как обновить профиль?
              </motion.h3>
              <motion.p className="help-answer" variants={answerVariants}>
                Перейдите в "Настройки" → "Профиль" для изменения информации о себе.
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
                Визуализация данных
              </motion.span>
            </h2>
            <motion.div className="help-item" variants={questionVariants}>
              <motion.h3 className="help-question" whileHover="hover">
                Диаграмма Ганта
              </motion.h3>
              <motion.p className="help-answer" variants={answerVariants}>
                На главном экране вы можете просмотреть диаграмму Ганта, которая отображает:<br />
                - Все текущие задачи<br />
                - Сроки их выполнения<br />
                - Прогресс выполнения<br />
                - Зависимости между задачами
              </motion.p>
            </motion.div>
            <motion.div className="help-item" variants={questionVariants}>
              <motion.h3 className="help-question" whileHover="hover">
                Круговая диаграмма
              </motion.h3>
              <motion.p className="help-answer" variants={answerVariants}>
                На главном экране доступна круговая диаграмма, показывающая:<br />
                - Распределение задач по статусам<br />
                - Процент выполненных задач<br />
                - Соотношение задач между проектами
              </motion.p>
            </motion.div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
};

export default Help;