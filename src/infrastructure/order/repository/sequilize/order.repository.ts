import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface{
  
  
  async update(entity: Order): Promise<void> {
    await OrderModel.update(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        where: {
          id: entity.id,
        },
      }
    );
  }

  async find(id: string): Promise<Order> {
   let orderModel;
   let order;
   try{
    orderModel = await OrderModel.findOne({
      where: {id},
      rejectOnEmpty: true
    });
    let items: OrderItem[] = this.mapAllItems(orderModel);

    order = this.mapToOrder(orderModel, items);
   } catch (error) {
    throw new Error("Order couldn't be found.");
   } finally {
    return order;
   }
  }

  async findAll(): Promise<Order[]> {
    let orders: Order[];
    try{
      let orderModels = await OrderModel.findAll();
      orderModels.forEach(orderModel => {
        let items: OrderItem[] = this.mapAllItems(orderModel);
        let order = this.mapToOrder(orderModel, items);
        orders.push(order);
      });
    } catch (error) {
      throw new Error("Error while fetching all data.");
    } finally {
      return orders;
    }
  }

  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }

  private mapAllItems(orderModel: OrderModel): OrderItem[]{
    let items: OrderItem[] = [];
    orderModel.items.forEach(itemModel => {
      let item = this.mapToOrderItem(itemModel);
      items.push(item)
    });
    return items;
  }

  private mapToOrderItem(itemModel: OrderItemModel): OrderItem {
    return new OrderItem(
      itemModel.id,
      itemModel.name,
      itemModel.price,
      itemModel.product_id,
      itemModel.quantity
    );
  }

  private mapToOrder(orderModel: OrderModel, items: OrderItem[]) {
    return new Order(
      orderModel.id,
      orderModel.customer_id,
      items
    );
  }



}
