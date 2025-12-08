import { Request, Response, NextFunction } from 'express';
import { SubscriptionService } from '../services/SubscriptionService';
import { PlanType } from '../interfaces/ISubscription';

export const subscriptionController = {
  async createSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const { residentialName, planType, pricing } = req.body;

      if (!residentialName || !planType) {
        return res.status(400).json({
          error: 'El nombre del residencial y el tipo de plan son requeridos',
        });
      }

      const subscription = await SubscriptionService.createSubscription({
        residentialName,
        planType,
        pricing,
      });

      res.status(201).json(subscription);
    } catch (error) {
      next(error);
    }
  },

  async getSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const subscription = await SubscriptionService.findById(id);
      if (!subscription) {
        return res.status(404).json({ error: 'Suscripción no encontrada' });
      }

      res.json(subscription);
    } catch (error) {
      next(error);
    }
  },

  async getAllSubscriptions(req: Request, res: Response, next: NextFunction) {
    try {
      const subscriptions = await SubscriptionService.getAllSubscriptions();
      res.json(subscriptions);
    } catch (error) {
      next(error);
    }
  },

  async getActiveSubscriptions(req: Request, res: Response, next: NextFunction) {
    try {
      const subscriptions = await SubscriptionService.getActiveSubscriptions();
      res.json(subscriptions);
    } catch (error) {
      next(error);
    }
  },

  async updateSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const subscription = await SubscriptionService.updateSubscription(id, updateData);

      if (!subscription) {
        return res.status(404).json({ error: 'Suscripción no encontrada' });
      }

      res.json(subscription);
    } catch (error) {
      next(error);
    }
  },

  async upgradePlan(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { planType, customAmount } = req.body;

      if (!planType) {
        return res.status(400).json({ error: 'El tipo de plan es requerido' });
      }

      const subscription = await SubscriptionService.upgradePlan(id, planType, customAmount);

      if (!subscription) {
        return res.status(404).json({ error: 'Suscripción no encontrada' });
      }

      res.json(subscription);
    } catch (error) {
      next(error);
    }
  },

  async activateSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const subscription = await SubscriptionService.activateSubscription(id);

      if (!subscription) {
        return res.status(404).json({ error: 'Suscripción no encontrada' });
      }

      res.json(subscription);
    } catch (error) {
      next(error);
    }
  },

  async cancelSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const subscription = await SubscriptionService.cancelSubscription(id);

      if (!subscription) {
        return res.status(404).json({ error: 'Suscripción no encontrada' });
      }

      res.json(subscription);
    } catch (error) {
      next(error);
    }
  },

  async suspendSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const subscription = await SubscriptionService.suspendSubscription(id);

      if (!subscription) {
        return res.status(404).json({ error: 'Suscripción no encontrada' });
      }

      res.json(subscription);
    } catch (error) {
      next(error);
    }
  },

  async updateUsage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { unitsCount } = req.body;

      if (typeof unitsCount !== 'number') {
        return res.status(400).json({
          error: 'La cantidad de viviendas debe ser un número',
        });
      }

      const subscription = await SubscriptionService.updateUsageCount(id, unitsCount);

      if (!subscription) {
        return res.status(404).json({ error: 'Suscripción no encontrada' });
      }

      res.json(subscription);
    } catch (error) {
      next(error);
    }
  },

  async checkLimits(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const limits = await SubscriptionService.checkLimits(id);
      res.json(limits);
    } catch (error) {
      next(error);
    }
  },

  async deleteSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const subscription = await SubscriptionService.deleteSubscription(id);

      if (!subscription) {
        return res.status(404).json({ error: 'Suscripción no encontrada' });
      }

      res.json({ message: 'Suscripción eliminada exitosamente' });
    } catch (error) {
      next(error);
    }
  },

  async getPlanDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { planType } = req.params;

      if (!Object.values(PlanType).includes(planType as PlanType)) {
        return res.status(400).json({ error: 'Tipo de plan inválido' });
      }

      const details = SubscriptionService.getPlanDetails(planType as PlanType);
      res.json(details);
    } catch (error) {
      next(error);
    }
  },

  async getAllPlansDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const plans = Object.values(PlanType).map((planType) =>
        SubscriptionService.getPlanDetails(planType)
      );
      res.json(plans);
    } catch (error) {
      next(error);
    }
  },
};
