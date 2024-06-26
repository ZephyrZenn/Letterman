use actix_web::{error::BlockingError, web::block};
use async_trait::async_trait;
use diesel::{r2d2::ConnectionManager, MysqlConnection};
use futures::{future::BoxFuture, FutureExt, TryFutureExt};
use mongodb::bson::Document;
use r2d2::Pool;

use thiserror::Error;

pub trait Validate {
    type Item;
    type Error: std::error::Error;

    fn validate(self) -> Result<Self::Item, Self::Error>;
}

#[derive(Debug, Error)]
pub enum DbActionError<E> {
    #[error("Database error: {0}")]
    Error(#[source] E),

    #[error("Pool error: {0}")]
    Pool(#[source] r2d2::Error),

    #[error("The request is canceled")]
    Canceled,
}

impl<E> From<BlockingError> for DbActionError<E>
where
    E: std::error::Error,
{
    fn from(_item: BlockingError) -> Self {
        DbActionError::Canceled
    }
}

impl<E> From<r2d2::Error> for DbActionError<E>
where
    E: std::error::Error,
{
    fn from(item: r2d2::Error) -> Self {
        DbActionError::Pool(item)
    }
}

pub trait DbAction {
    type Item: Send + 'static;
    type Error: std::error::Error + Send;

    fn db_action(self, conn: &mut MysqlConnection) -> Result<Self::Item, Self::Error>;

    fn execute(
        self,
        pool: Pool<ConnectionManager<MysqlConnection>>,
    ) -> BoxFuture<'static, Result<Self::Item, DbActionError<Self::Error>>>
    where
        Self: std::marker::Sized + Send + 'static,
    {
        let result = block(move || -> Result<Self::Item, DbActionError<Self::Error>> {
            let conn = &mut pool.get()?;
            self.db_action(conn).map_err(DbActionError::Error)
        })
        .map_err(DbActionError::from);

        let result = result.map(|r| r.and_then(|inner| inner));
        result.boxed()
    }
}

#[derive(Debug, Error)]
pub enum MongoActionError<E> {
    #[error("Database error: {0}")]
    Error(#[source] E),
    #[error("Pool error: {0}")]
    Pool(mongodb::error::Error),
}

#[async_trait]
pub trait MongoAction {
    type Item: Send + 'static;
    type Error: std::error::Error + Send;

    async fn mongo_action(self, db: mongodb::Database) -> Result<Self::Item, Self::Error>;

    async fn execute(
        self,
        db: mongodb::Database,
    ) -> Result<Self::Item, MongoActionError<Self::Error>>
    where
        Self: std::marker::Sized + Send + 'static,
    {
        self.mongo_action(db).await.map_err(MongoActionError::Error)
    }
}

pub trait DocumentConvert {
    fn to_doc(self) -> Document;
}
